import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { VoyageAIClient } from "voyageai";
import faiss from 'faiss-node'
import 'dotenv/config';

const geographyText = fs.readFileSync('./wiki_data/geography.txt', 'utf-8');
const paragraphs = geographyText.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== '');
const dataSource = paragraphs;

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const getEmbeddings = async (texts) => {
  try {
    const response = await voyage.embed({
      input: texts,
      model: "voyage-3-lite",
    });

    if (!response.data || response.data.length === 0) {
      console.error("No embeddings returned!");
    return null;
    }

    const embeddings = response.data.length === 1 ? response.data[0].embedding : response.data.map(entry => entry.embedding);

    return embeddings;
  } catch (error) {
      console.error("Error generating embeddings with Voyage AI:", error.response ? error.response.data : error.message);
    return null;
  }
};

const storeEmbeddingsFAISS = async (embeddings, texts) => {
  const directory = "./faiss_indices";
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const dimension = embeddings[0].length;
  const index = new faiss.IndexFlatL2(dimension);

  embeddings.forEach((embedding) => {
    index.add(embedding);
  });

  fs.writeFileSync(`${directory}/index.faiss`, index.toBuffer());
  fs.writeFileSync(`${directory}/metadata.json`, JSON.stringify(texts));

  console.log("FAISS index stored successfully!");
};


const retrieveFromFAISS = async (queryEmbedding) => {
  const directory = "./faiss_indices";
  const indexBuffer = fs.readFileSync(`${directory}/index.faiss`);
  const index = faiss.IndexFlatL2.fromBuffer(indexBuffer);
  const texts = JSON.parse(fs.readFileSync(`${directory}/metadata.json`, "utf-8"));
  const results = index.search(queryEmbedding, 1);
  const indices = results.labels

  return indices.map(i => texts[i]);
};


const processPromptWithRAG = async (userPrompt) => {
  const queryEmbedding = await getEmbeddings([userPrompt]);
  if (!queryEmbedding || queryEmbedding.length === 0) {
    console.error("No query embedding generated!");
    return "Error: No relevant context found.";
  }

  const retrievedDocs = await retrieveFromFAISS(queryEmbedding);
  console.log("Retrieved Context:", retrievedDocs);

  const augmentedPrompt = `Context:\n${retrievedDocs.join("\n")}\n\nUser Query:\n${userPrompt}`;
  return augmentedPrompt;
};


const main = async () => {
  console.log("Generating embeddings using VoyageAI...");
  const embeddings = await getEmbeddings(dataSource);
  await storeEmbeddingsFAISS(embeddings, dataSource);
  if (embeddings) {
    console.log("VoyageAI embeddings generated successfully!");
    console.log("First VoyageAI embedding (truncated):\n", embeddings[0].slice(0, 10), "...");
  } else {
    console.log("VoyageAI embedding generation failed.");
  }

  const userPrompt = "What are some branches of physical geography?";
  const augmentedPrompt = await processPromptWithRAG(userPrompt);
  console.log(augmentedPrompt)
};

main();
export default processPromptWithRAG;