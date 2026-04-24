import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import healthResources from "./health_resources.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RAGSource {
  id: string;
  fileName: string;
  snippet: string;
  score: number;
}

// Simple keyword matching function for mock RAG
function calculateRelevanceScore(query: string, resource: any): number {
  const queryLower = query.toLowerCase();
  const contentLower = (resource.title + " " + resource.content + " " + resource.category).toLowerCase();

  // Count matching words
  const queryWords = queryLower.split(/\s+/);
  let matches = 0;

  queryWords.forEach(word => {
    if (word.length > 3 && contentLower.includes(word)) {
      matches++;
    }
  });

  return matches / queryWords.length;
}

export async function retrieveContext(
  query: string,
  knowledgeBaseId: string = "mock",
  n: number = 3,
): Promise<{
  context: string;
  isRagWorking: boolean;
  ragSources: RAGSource[];
}> {
  try {
    console.log("🔍 Using mock health resources for query:", query);

    // Filter and score resources based on query
    const scoredResources = healthResources.resources
      .map(resource => ({
        resource,
        score: calculateRelevanceScore(query, resource)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

    // If no good matches, return all resources with lower scores
    const finalResources = scoredResources.length > 0
      ? scoredResources
      : healthResources.resources.slice(0, n).map(resource => ({
          resource,
          score: 0.1
        }));

    const ragSources: RAGSource[] = finalResources.map(item => ({
      id: item.resource.id,
      fileName: item.resource.category,
      snippet: item.resource.content.substring(0, 200) + "...",
      score: item.score,
    }));

    const context = finalResources
      .map(item => `${item.resource.title}: ${item.resource.content}`)
      .join("\n\n");

    console.log("✅ Mock RAG retrieved", ragSources.length, "sources");

    return {
      context,
      isRagWorking: true,
      ragSources: ragSources.slice(0, 1), // Only show top result
    };
  } catch (error) {
    console.error("Mock RAG Error:", error);
    return { context: "", isRagWorking: false, ragSources: [] };
  }
}
