import { supabase } from "../lib/supabaseClient";

export async function saveNewTags(inputTags, type) {
  async function updateTags(inputTags) {
    let status = 'started';
    
    // Fetch all existing SubGroups from the database
    const { data: existingTags, error: fetchError } = await supabase
      .from("tags")
      .select("tag")
      .eq('type', type);
      
    if (fetchError) throw fetchError;

    // Convert the existing tags to a Set for faster lookup
    const existingTagsSet = new Set(existingTags.map(item => item.tag));

    // Filter out the Namess that already exist
    const newTags = inputTags.filter(tag => !existingTagsSet.has(tag));

    // Insert new labels
    for (const tag of newTags) {
      const updates = {
        tag,
        type
      };

      const { data, error } = await supabase
        .from("tags")
        .upsert(updates, { onConflict: ['tag', 'type'] })
        .select('*');

      if (error) throw error;

      if (!data) {
        throw new Error("Failed to update the name");
      }
    }

    status = 'done';
    return status;
  }

  const { status } = await updateTags(inputTags);
  return status;
}
