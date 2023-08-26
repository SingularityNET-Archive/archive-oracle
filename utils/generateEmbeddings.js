import { supabase } from "../lib/supabaseClient";
import { Configuration, OpenAIApi } from 'openai'
import { createHash } from 'crypto'

  let info = {}
  let content = "Live testing of embedding creation"

export async function generateEmbeddings() {
    
    async function generate() {
      const checksum = createHash('sha256').update(content).digest('base64')
      const input = content.replace(/\n/g, ' ')

        try {
          const configuration = new Configuration({
            apiKey: process.env.OPENAI_KEY,
          })
          const openai = new OpenAIApi(configuration)

          const embeddingResponse = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input,
          })

          if (embeddingResponse.status !== 200) {
            throw new Error(inspect(embeddingResponse.data, false, 2))
          }

          const [responseData] = embeddingResponse.data.data

          const { error: upsertPageError, data: page } = await supabase
            .from('docs_page')
            .upsert(
              {
                checksum: null,
                path: "test/page",
                type: "markdown",
                source: "guide",
                meta: {},
                parent_page_id: 1,
              },
              { onConflict: 'path' }
            )
            .select()
            .limit(1)
            .single()
    
          if (upsertPageError) {
            throw upsertPageError
          }

          const { error: insertPageSectionError, data: pageSection } = await supabase
            .from('docs_page_section')
            .insert({
              page_id: page.id,
              slug: "live-testing",
              heading: "Live Testing",
              content,
              token_count: embeddingResponse.data.usage.total_tokens,
              embedding: responseData.embedding,
            })
            .select()
            .limit(1)
            .single()

            info = pageSection;
          if (insertPageSectionError) {
            throw insertPageSectionError
          }
          const { error: updatePageError } = await supabase
            .from('docs_page')
            .update({ checksum })
            .filter('id', 'eq', page.id)
    
          if (updatePageError) {
            throw updatePageError
          }
        } catch (error) {
        if (error) {
          info = []
          console.log("error", error.message)
          //alert(error.message);
        } else {
          console.error('Unknown error: ', error);
        }
      }
    }
    
    async function main() {
        await generate()
    }
      
    main().catch((err) => console.error(err))

  return info;
}