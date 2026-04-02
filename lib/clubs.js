import { supabase } from './supabase'

const TABLE = 'clubs'

export async function getClubs() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')

  if (error) {
    throw error
  }

  return data
}

export async function addClub(club) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([club])
    .select('*')

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateClub(id, data) {
  const { data: updated, error } = await supabase
    .from(TABLE)
    .update(data)
    .eq('id', id)
    .select('*')

  if (error) {
    throw error
  }

  return updated?.[0] ?? null
}

export async function deleteClub(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }

  return data
}
