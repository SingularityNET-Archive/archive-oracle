import { supabase } from "../lib/supabaseClient";

export async function saveNewTags(inputTags) {
  async function updateTags(inputTags) {
    let status = 'started';
    
    // Fetch all existing SubGroups from the database
    const { data: existingNames, error: fetchError } = await supabase
      .from("tags")
      .select("tag");
      
    if (fetchError) throw fetchError;

    // Convert the existing Namess to a Set for faster lookup
    const existingNamesSet = new Set(existingNames.map(item => item.name));

    // Filter out the Namess that already exist
    const newNames = inputTags.filter(name => !existingNamesSet.has(name));

    // Insert new labels
    for (const name of newNames) {
      const updates = {
        name,
        type
      };

      const { data, error } = await supabase
        .from("tags")
        .upsert(updates)
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
