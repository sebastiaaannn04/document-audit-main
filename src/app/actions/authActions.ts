'use server'

import { getSupabaseServerClient } from '@/lib/supabase'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Por favor, completa todos los campos.' }
  }

  const supabase = getSupabaseServerClient()

  // Check if user exists
  const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUserError) {
    console.error('Registration error:', existingUserError)
    return { error: 'Error al validar el usuario. Intenta nuevamente.' }
  }

  if (existingUser) {
    return { error: 'Ya existe un usuario con este correo electrónico.' }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({ name }, { onConflict: 'name' })
      .select('id, name')
      .single()

    if (companyError || !company) {
      console.error('Registration error:', companyError)
      return { error: 'Error al crear la empresa. Intenta nuevamente.' }
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'COMPANY',
        company_id: company.id,
      })
      .select('id, role, name, company_id')
      .single()

    if (userError || !user) {
      console.error('Registration error:', userError)
      return { error: 'Error al crear la cuenta. Intenta nuevamente.' }
    }

    await createSession(user.id, user.role, user.name, user.company_id)
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Error al crear la cuenta. Intenta nuevamente.' }
  }

  redirect('/')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor, ingresa correo y contraseña.' }
  }

  const supabase = getSupabaseServerClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, email, password, role, company_id')
    .eq('email', email)
    .maybeSingle()

  if (userError) {
    console.error('Login error:', userError)
    return { error: 'Error al iniciar sesión. Intenta nuevamente.' }
  }

  if (!user || !user.password) {
    return { error: 'Credenciales inválidas.' }
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return { error: 'Credenciales inválidas.' }
  }

  await createSession(user.id, user.role, user.name, user.company_id)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
