import { supabase } from '../lib/supabase';

export async function getVacancies() {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createVacancy(vacancy) {
  const { data, error } = await supabase
    .from('vacancies')
    .insert([vacancy])
    .select();
    
  if (error) throw error;
  return data[0];
}

export async function updateVacancy(id, updates) {
  const { data, error } = await supabase
    .from('vacancies')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
}

export async function deleteVacancy(id) {
  const { error } = await supabase
    .from('vacancies')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
