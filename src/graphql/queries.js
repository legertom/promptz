/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPrompt = /* GraphQL */ `
  query GetPrompt($id: ID!) {
    getPrompt(id: $id) {
      id
      name
      prompt
      description
      createdAt
      updatedAt
    }
  }
`;
export const listPrompts = /* GraphQL */ `
  query ListPrompts(
    $filter: ModelPromptFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPrompts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        prompt
        description
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
