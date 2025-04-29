import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

let vectorStore: HNSWLib | null = null;

export async function initializeVectorStore() {
  if (!vectorStore) {
    vectorStore = await HNSWLib.fromDocuments([], new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }));
  }
  return vectorStore;
}

export async function addDocumentToVectorStore(content: string, metadata: { fileId: string; fileName: string }) {
  const vectorStore = await initializeVectorStore();
  await vectorStore.addDocuments([
    new Document({
      pageContent: content,
      metadata,
    }),
  ]);
}

export async function queryVectorStore(query: string, k: number = 3) {
  const vectorStore = await initializeVectorStore();
  return await vectorStore.similaritySearch(query, k);
}