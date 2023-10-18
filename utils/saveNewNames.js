import { supabase } from "../lib/supabaseClient";

export async function saveNewNames(inputNames) {
  async function updateNames(inputNames) {
    let status = 'started';
    
    // Fetch all existing SubGroups from the database
    const { data: existingNames, error: fetchError } = await supabase
      .from("names")
      .select("name");
      
    if (fetchError) throw fetchError;

    // Convert the existing Namess to a Set for faster lookup
    const existingNamesSet = new Set(existingNames.map(item => item.name));

    // Filter out the Namess that already exist
    const newNames = inputNames.filter(name => !existingNamesSet.has(name));

    // Insert new labels
    for (const name of newNames) {
      const updates = {
        name,
      };

      const { data, error } = await supabase
        .from("names")
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

  const { status } = await updateNames(inputNames);
  return status;
}
