import { useState, useEffect } from 'react';
import { Ticket, TrendingUp, Users, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../features/api';

export default function TicketSalesPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.get('/events/my').then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalSold     = events.reduce((s, e) => s + (e.tickets?.reduce((ts, t) => ts + (t.sold || 0), 0) || 0), 0);
  const totalCapacity = events.reduce((s, e) => s + (e.totalCapacity || 0), 0);
  const totalRevenue  = events.reduce((s, e) => s + (e.tickets?.reduce((ts, t) => ts + ((t.sold || 0) * Number(t.price)), 0) || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ticket Sales</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <Ticket size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Tickets Sold</p>
            <p className="text-2xl font-bold text-gray-900">{totalSold.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Overall Fill Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalCapacity ? Math.round((totalSold / totalCapacity) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500 flex items-center justify-center shrink-0">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">৳{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Per Event Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Ticket size={40} className="mx-auto mb-3 opacity-30" />
          <p>No events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const sold     = ev.tickets?.reduce((s, t) => s + (t.sold || 0), 0) || 0;
            const capacity = ev.totalCapacity || 0;
            const revenue  = ev.tickets?.reduce((s, t) => s + ((t.sold || 0) * Number(t.price)), 0) || 0;
            const fill     = capacity ? Math.round((sold / capacity) * 100) : 0;
            const isOpen   = expanded[ev.id];

            return (
              <div key={ev.id} className="card overflow-hidden">
                {/* Event Row */}
                <button
                  onClick={() => toggle(ev.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-500 shrink-0">
                    {ev.coverImage
                      ? <img src={ev.coverImage} alt="" className="w-full h-full object-cover" />
                      : <div className="flex items-center justify-center h-full"><Ticket size={20} className="text-white opacity-60" /></div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

                    {/* Progress bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fill >= 80 ? 'bg-red-500' : fill >= 50 ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${fill}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{fill}% full</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 mr-2">
                    <p className="font-bold text-gray-900">{sold} <span className="text-xs font-normal text-gray-400">/ {capacity}</span></p>
                    <p className="text-xs text-green-600 font-semibold">৳{revenue.toLocaleString()}</p>
                  </div>

                  {isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                </button>

                {/* Ticket Type Breakdown */}
                {isOpen && ev.tickets?.length > 0 && (
                  <div className="border-t bg-gray-50 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ticket Type Breakdown</p>
                    <div className="space-y-2">
                      {ev.tickets.map(t => {
                        const tSold = t.sold || 0;
                        const tFill = t.quantity ? Math.round((tSold / t.quantity) * 100) : 0;
                        return (
                          <div key={t.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{t.type}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${tFill}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">{tFill}%</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 text-sm">
                              <p className="font-semibold text-gray-900">{tSold} <span className="text-xs text-gray-400 font-normal">/ {t.quantity}</span></p>
                              <p className="text-xs text-gray-500">৳{Number(t.price).toLocaleString()} each</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-green-600">৳{(tSold * Number(t.price)).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
