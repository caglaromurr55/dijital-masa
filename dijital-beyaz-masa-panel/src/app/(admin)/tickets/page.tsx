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

      {/* ÜST BAŞLIK ALANI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors">
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md dark:shadow-none">
              <TicketIcon size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase truncate">
              Talep Yönetimi
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm max-w-lg">
            Vatandaş şikayet ve isteklerini buradan profesyonelce yönetin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <ExportButton data={tickets || []} />

          <div className="flex-1 md:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-900/10 flex flex-col items-center min-w-24 sm:min-w-30">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5 sm:mb-1">Toplam Talep</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-500">{totalCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[40rem]">
        {/* Talep Listesi Bileşeni */}
        <div className="flex-1 overflow-x-auto">
          <TicketList initialTickets={tickets || []} />
        </div>

        {/* SAYFALAMA KONTROLLERİ */}
        {totalPages > 1 && (
          <div className="mt-auto flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 gap-6">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-left">
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

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none px-2 py-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isVisible = pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                  if (isVisible) {
                    return (
                      <Link
                        key={pageNum}
                        href={`?page=${pageNum}${search ? `&search=${search}` : ''}`}
                        className={`flex items-center justify-center shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-md dark:shadow-none"
                          : "text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  }
                  if (pageNum === 2 && currentPage > 3) return <span key="dots-1" className="text-slate-400 px-1">...</span>;
                  if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots-2" className="text-slate-400 px-1">...</span>;
                  return null;
                })}
              </div>

              <Link
                href={`?page=${Math.min(totalPages, currentPage + 1)}${search ? `&search=${search}` : ''}`}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all ${currentPage === totalPages && "pointer-events-none opacity-30"}`}
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