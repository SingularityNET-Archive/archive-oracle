import { useState } from "react";
import type { NextPage } from "next";
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGING_FACE)

const Home: NextPage = () => {
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  async function getAssets() {
    setLoading(true);
    try {
      const response = await hf.textGeneration({
        model: 'gpt2',
        inputs: inputValue
      });
      setAssets(response.generated_text);
      console.log(response);
    } catch (error) {
      // Handle error if the request fails
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Home</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={getAssets} disabled={loading}>
        {loading ? "Loading..." : "Test GPT2"}
      </button>
      <p>{assets ? assets : ""}</p>
    </div>
  );
};

export default Home;
