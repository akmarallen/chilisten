import { supabase } from "../lib/supabase";
import { Tables, Enums } from "./database.types";

export type Report = Tables<"reports">;
export type ReportInsert = Tables<"reports">;
export type ReportUpdate = Tables<"reports">;

export const reportService = {
  async createReport(report: ReportInsert): Promise<void> {
    const { error } = await supabase.from("reports").insert(report);

    if (error) throw new Error(error.message);
  },

  async updateReportStatus(
    reportId: string,
    status: Enums<"report_status">,
  ): Promise<void> {
    const { error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId);

    if (error) throw new Error(error.message);
  },

  async getPendingReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .in("status", ["NEW", "PENDING"])
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data as Report[];
  },
};
