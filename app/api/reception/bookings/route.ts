import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTotalDurationMinutes, getServiceDurationMinutes } from '@/lib/service-durations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const result = await db.query(`
      SELECT 
        a.id, 
        a.service_type, 
        a.appointment_date, 
        a.status, 
        a.client_id,
        a.user_id,
        a.provider_id,
        a.notes,
        a.appointment_type,
        a.cancellation_reason,
        a.duration_minutes,
        a.recurrence_rule,
        a.recurrence_end_date,
        COALESCE(c.name, u.name) as client_name,
        COALESCE(c.phone, u.phone) as phone,
        COALESCE(c.email, u.email) as email
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.appointment_date DESC
    `);

    const rows = result.rows;
    try {
      const withServices = await Promise.all(
        rows.map(async (row: Record<string, unknown>) => {
          const svc = await db.query(
            'SELECT service_type, duration_minutes FROM appointment_services WHERE appointment_id = $1 ORDER BY sort_order',
            [row.id]
          );
          const services = svc.rows.length > 0 ? svc.rows : [{ service_type: row.service_type, duration_minutes: row.duration_minutes ?? 60 }];
          return { ...row, services };
        })
      );
      return NextResponse.json(withServices);
    } catch {
      return NextResponse.json(rows);
    }
  } catch (error) {
    if (String(error).includes('clients') || String(error).includes('client_id') || String(error).includes('provider_id') || String(error).includes('column')) {
      const fallback = await db.query(`
        SELECT a.id, a.service_type, a.appointment_date, a.status, a.user_id,
               u.name as client_name, u.phone, u.email
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.appointment_date DESC
      `);
      return NextResponse.json(fallback.rows);
    }
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reception/bookings
 * Body: client_id, services (string[]), date, time, provider_id?, appointment_type?, notes?, recurrence_rule?, recurrence_end_date?
 * Single-service backward compat: service (string) instead of services.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      client_id,
      service,
      services: servicesArr,
      date,
      time,
      provider_id,
      appointment_type = 'treatment',
      notes,
      recurrence_rule,
      recurrence_end_date,
    } = body;

    const services: string[] = Array.isArray(servicesArr) && servicesArr.length > 0
      ? servicesArr.map((s: string) => String(s).trim()).filter(Boolean)
      : service ? [String(service).trim()] : [];
    if (services.length === 0 || !date || !time) {
      return NextResponse.json(
        { error: 'client_id, service(s), date, and time are required' },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(`${date}T${time}:00`);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time' }, { status: 400 });
    }
    const clientId = Number(client_id);
    if (!Number.isInteger(clientId)) {
      return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
    }
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const durationMinutes = getTotalDurationMinutes(services);
    const providerId = provider_id != null ? parseInt(String(provider_id), 10) : null;

    if (providerId != null && !Number.isNaN(providerId)) {
      const startTs = appointmentDate.toISOString();
      const endTs = new Date(appointmentDate.getTime() + durationMinutes * 60 * 1000).toISOString();
      const conflict = await db.query(
        `SELECT id FROM appointments
         WHERE provider_id = $1 AND status NOT IN ('cancelled')
           AND appointment_date::date = $2::date
           AND (appointment_date + (COALESCE(duration_minutes, 60) || ' minutes')::interval) > $3::timestamp
           AND appointment_date < $4::timestamp`,
        [providerId, date, startTs, endTs]
      ).catch(() => ({ rows: [] }));
      if (conflict.rows?.length > 0) {
        return NextResponse.json(
          { error: 'This time slot is already booked for the selected provider. Please choose another time.' },
          { status: 409 }
        );
      }
    }

    const insertAppointment = async (at: Date) => {
      const ins = await db.query(
        `INSERT INTO appointments (
          client_id, service_type, appointment_date, status, provider_id,
          notes, appointment_type, duration_minutes, recurrence_rule, recurrence_end_date
        ) VALUES ($1, $2, $3, 'confirmed', $4, $5, $6, $7, $8, $9)
        RETURNING id, client_id, service_type, appointment_date, status, provider_id, notes, appointment_type`,
        [
          clientId,
          services[0],
          at,
          providerId,
          notes ?? null,
          appointment_type,
          durationMinutes,
          recurrence_rule ?? null,
          recurrence_end_date ?? null,
        ]
      );
      const row = ins.rows[0];
      for (let i = 0; i < services.length; i++) {
        await db.query(
          `INSERT INTO appointment_services (appointment_id, service_type, duration_minutes, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [row.id, services[i], getServiceDurationMinutes(services[i]), i]
        ).catch(() => {});
      }
      return row;
    };

    const created: unknown[] = [];
    if (recurrence_rule === 'weekly' && recurrence_end_date) {
      const end = new Date(recurrence_end_date + 'T23:59:59');
      let d = new Date(appointmentDate);
      while (d <= end) {
        const row = await insertAppointment(d);
        created.push(row);
        d.setDate(d.getDate() + 7);
      }
    } else {
      const row = await insertAppointment(appointmentDate);
      created.push(row);
    }

    const client = await db.query('SELECT name, phone, email FROM clients WHERE id = $1', [clientId]);
    const first = Array.isArray(created) ? created[0] : created;
    return NextResponse.json({
      ...(first as Record<string, unknown>),
      client_name: client.rows[0]?.name,
      phone: client.rows[0]?.phone,
      email: client.rows[0]?.email,
      created_count: created.length,
    }, { status: 201 });
  } catch (err) {
    if (String(err).includes('client_id') || String(err).includes('column')) {
      return NextResponse.json(
        { error: 'Clients migration not applied. Run scripts/run-clients-migration.js' },
        { status: 503 }
      );
    }
    console.error('Reception booking create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
