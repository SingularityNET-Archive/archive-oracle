import { supabase } from "../lib/supabaseClient";
import { Configuration, OpenAIApi } from 'openai'

  let info = {}
  let content = "Testing creating embeddings"

export async function generateEmbeddings() {
    
    async function generate() {
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

          const { error: insertPageSectionError, data: pageSection } = await supabase
            .from('embeddings_table')
            .insert({
              page_id: 1,
              slug: "Testing",
              heading: "Testing",
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