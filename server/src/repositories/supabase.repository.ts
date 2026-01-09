import { supabase } from "../lib/supabase";

type UploadFileParams = {
  buffer: Buffer;
  path: string;
  contentType: string;
};

export class SupabaseRepository {
  private bucket = "main-bucket";

  async upload(params: UploadFileParams): Promise<{ publicUrl: string }> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(params.path, params.buffer, {
        contentType: params.contentType
      });

    if (data) {
      return {
        publicUrl: supabase.storage.from(this.bucket).getPublicUrl(params.path)
          .data.publicUrl
      };
    } else {
      throw new Error(error.message);
    }
  }
}
