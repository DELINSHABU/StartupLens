"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Clock } from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from "@/services/eventService";
import { Event } from "@/types";

const emptyForm = { title: "", description: "", date: "", location: "" };

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch {
      // Firebase not configured yet
    }
  }

  async function handleSubmit() {
    if (editing) {
      await updateEvent(editing.id, form);
    } else {
      await createEvent(form);
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
    loadEvents();
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    loadEvents();
  }

  function handleEdit(event: Event) {
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
    });
    setEditing(event);
    setOpen(true);
  }

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto w-full">
      <FadeIn className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dce1fb] mb-1">
            Ecosystem Events
          </h1>
          <p className="text-[#c2c6d9]">
            Discover and organize startup ecosystem events and meetups.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { setEditing(null); setForm(emptyForm); }}
              className="bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-[#191f31] border-[#424656]/20 text-[#dce1fb]">
            <DialogHeader>
              <DialogTitle className="text-[#dce1fb]">
                {editing ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                  Event Title
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. AI Founders Meetup"
                  className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the event..."
                  rows={3}
                  className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-[#c2c6d9] uppercase tracking-widest">
                    Location
                  </Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Abu Dhabi, UAE"
                    className="bg-[#070d1f] border-[#424656]/20 text-[#dce1fb] mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1 text-[#c2c6d9]">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-[#0062ff] to-[#b4c5ff] text-white">
                  {editing ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </FadeIn>

      {events.length === 0 ? (
        <div className="text-center py-20 text-[#c2c6d9]">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm">Create events to connect the ecosystem.</p>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <StaggerItem
              key={event.id}
              className="bg-[#151b2d] p-6 rounded-xl border border-[#424656]/10 hover:bg-[#191f31] transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0062ff]/20 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-[#b4c5ff]" />
                  </div>
                  <h3 className="font-bold text-[#dce1fb]">{event.title}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(event)} className="p-1.5 rounded hover:bg-[#2e3447]">
                    <Pencil className="w-3.5 h-3.5 text-[#c2c6d9]" />
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="p-1.5 rounded hover:bg-[#2e3447]">
                    <Trash2 className="w-3.5 h-3.5 text-[#ffb4ab]" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#c2c6d9] leading-relaxed mb-4 line-clamp-2">
                {event.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#c2c6d9]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#b4c5ff]" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#7bd0ff]" />
                  {event.location}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
