// pollingNotificationEvents.js
// Polls Supabase for pending notification events and processes them

import { supabase } from "./supabase.js";

import { orchestrateNotification } from "./services/orchestrator.service.js";

const POLL_INTERVAL_MS = 60000; // 60 seconds
const BATCH_SIZE = 5;

async function pollAndProcessEvents() {
  try {
    // 1. Buscar eventos pendientes
    const { data: events, error } = await supabase
      .from("notification_events")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.error("Error fetching notification events:", error);
      return;
    }
    if (!events || events.length === 0) {
      return; // Nada que hacer
    }

    for (const event of events) {
      try {
        // 2. Procesar evento usando la lógica robusta existente
        const { tipo, horario } = event;
        await orchestrateNotification({ tipo, horario });

        // 3. Marcar como procesado
        const { error: updateError } = await supabase
          .from("notification_events")
          .update({ processed: true })
          .eq("id", event.id);
        if (updateError) {
          console.error(`Error updating event ${event.id}:`, updateError);
        }
      } catch (err) {
        console.error(`Error processing event ${event.id}:`, err);
      }
    }
  } catch (err) {
    console.error("Polling error:", err);
  }
}

// Loop
setInterval(pollAndProcessEvents, POLL_INTERVAL_MS);

// Opcional: ejecutar al iniciar
pollAndProcessEvents();
