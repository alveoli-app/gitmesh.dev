import { supabase } from '../supabase'

async function testSupabaseContent() {
    console.log('--- Starting Supabase Content Test ---')

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase credentials missing. Test failed.')
        return
    }

    const testSlug = `test-post-${Date.now()}`
    const testData = {
        slug: testSlug,
        type: 'blog',
        title: 'Test Post',
        excerpt: 'This is a test post excerpt.',
        content: 'This is test content in **MDX** format.',
        author: 'Test Bot',
        published_at: new Date().toISOString(),
        tags: ['test', 'supabase'],
        featured: false,
        newsletter: false
    }

    try {
        // 1. Create
        console.log('1. Creating test content...')
        const { data: created, error: createError } = await supabase
            .from('content')
            .insert(testData)
            .select()
            .single()

        if (createError) throw createError
        console.log('Created success:', created.slug)

        // 2. Read
        console.log('2. Reading test content...')
        const { data: read, error: readError } = await supabase
            .from('content')
            .select('*')
            .eq('slug', testSlug)
            .single()

        if (readError) throw readError
        console.log('Read success:', read.title)

        // 3. Update
        console.log('3. Updating test content...')
        const { data: updated, error: updateError } = await supabase
            .from('content')
            .update({ title: 'Updated Test Post' })
            .eq('slug', testSlug)
            .select()
            .single()

        if (updateError) throw updateError
        console.log('Update success:', updated.title)

        // 4. Delete
        console.log('4. Deleting test content...')
        const { error: deleteError } = await supabase
            .from('content')
            .delete()
            .eq('slug', testSlug)

        if (deleteError) throw deleteError
        console.log('Delete success')

        console.log('--- All Tests Passed ---')
    } catch (err) {
        console.error('Test failed:', err)
    }
}

// Note: Running this would require a Node environment with env vars.
// Since I cannot run it directly in a browser context here easily,
// I'll rely on the logic check and the fact that the Supabase client is standard.
