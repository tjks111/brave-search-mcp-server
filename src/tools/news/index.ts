import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import params, { type QueryParams } from './params.js';
import API from '../../BraveAPI/index.js';
import { stringify } from '../../utils.js';

export const name = 'brave_news_search';

export const annotations: ToolAnnotations = {
  title: 'Brave News Search',
};

export const description = `
    This tool searches for news articles using Brave's News Search API based on the user's query. Use it when you need current news information, breaking news updates, or articles about specific topics, events, or entities.
    
    When to use:
        - Finding recent news articles on specific topics
        - Getting breaking news updates
        - Researching current events or trending stories
        - Gathering news sources and headlines for analysis

    Returns a JSON list of news-related results with title, url, and description. Some results may contain snippets of text from the article.
    
    When relaying results in markdown-supporting environments, always cite sources with hyperlinks.
    
    Examples:
        - "According to [Reuters](https://www.reuters.com/technology/china-bans/), China bans uncertified and recalled power banks on planes".
        - "The [New York Times](https://www.nytimes.com/2025/06/27/us/technology/ev-sales.html) reports that Tesla's EV sales have increased by 20%".
        - "According to [BBC News](https://www.bbc.com/news/world-europe-65910000), the UK government has announced a new policy to support renewable energy".
`;

export const execute = async (params: QueryParams) => {
  const response = await API.issueRequest<'news'>('news', params);

  return {
    content: response.results.map((newsResult) => {
      return {
        type: 'text' as const,
        text: stringify({
          url: newsResult.url,
          title: newsResult.title,
          age: newsResult.age,
          page_age: newsResult.page_age,
          breaking: newsResult.breaking ?? false,
          description: newsResult.description,
          extra_snippets: newsResult.extra_snippets,
          thumbnail: newsResult.thumbnail?.src,
        }),
      };
    }),
  };
};

export default {
  name,
  description,
  annotations,
  inputSchema: params.shape,
  execute,
};