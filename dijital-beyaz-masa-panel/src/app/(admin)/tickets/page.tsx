import TicketList from "@/components/tickets/TicketList";
import { getTickets } from "@/actions/tickets";
import { Ticket as TicketIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ExportButton from "@/components/reports/ExportButton";

const ITEMS_PER_PAGE = 20;

export const dynamic = 'force-dynamic';

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; sort?: string; order?: string; status?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const currentPage = parseInt(params.page || "1", 10);
  /* New Params */
  const sortColumn = params.sort || "created_at";
  const sortDirection = (params.order === "asc" ? "asc" : "desc") as "asc" | "desc";
  const statusFilter = params.status || "all";

  /* REMOVED: Direct Supabase Client Creation */
  const { data: tickets, count } = await getTickets(search, currentPage, sortColumn, sortDirection, statusFilter);
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">

      {/* ÜST BAŞLIK ALANI - Kırmızı işaretli 'Sayfa' kutusu kaldırıldı */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <TicketIcon size={20} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Talep Yönetimi
            </h1>
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">
            Vatandaş şikayet ve isteklerini buradan profesyonelce yönetin.
          </p>
        </div>

        <div className="flex gap-4">
          <ExportButton data={tickets || []} />

          <div className="px-6 py-3 rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/20 flex flex-col items-center min-w-30">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Toplam Talep</span>
            <span className="text-2xl font-black text-blue-600">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Kırmızı ile işaretlenen orta kısımdaki arama çubuğu kaldırıldı */}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-150">
        {/* Talep Listesi Bileşeni */}
        <TicketList initialTickets={tickets || []} />

        {/* SAYFALAMA KONTROLLERİ */}
        {totalPages > 1 && (
          <div className="mt-auto flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 gap-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Toplam <span className="text-slate-900 dark:text-slate-200">{totalCount}</span> Kayıttan
              <span className="text-slate-900 dark:text-slate-200 mx-1">{from + 1} - {Math.min(to + 1, totalCount)}</span>
              arası gösteriliyor
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`?page=${Math.max(1, currentPage - 1)}${search ? `&search=${search}` : ''}`}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all ${currentPage === 1 && "pointer-events-none opacity-30"}`}
              >
                <ChevronLeft size={18} />
              </Link>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <Link
                        key={pageNum}
                        href={`?page=${pageNum}${search ? `&search=${search}` : ''}`}
                        className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                          : "text-slate-400 hover:text-blue-600 bg-white border border-slate-100"
                          }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  }
                  return null;
                })}
              </div>

              <Link
                href={`?page=${Math.min(totalPages, currentPage + 1)}${search ? `&search=${search}` : ''}`}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 transition-all ${currentPage === totalPages && "pointer-events-none opacity-30"}`}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}