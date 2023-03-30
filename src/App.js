import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
  withAuthenticator,
  Flex,
  Text,
  TextField,
  Button,
  Heading,
  Image,
  View,
  Card,
} from "@aws-amplify/ui-react";
import { listPrompts } from "./graphql/queries";
import {
  createPrompt as createPromptMutation,
  deletePrompt as deletePromptMutation,
} from "./graphql/mutations";

function App({ signOut }) {
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    const apiData = await API.graphql({ query: listPrompts });
    const promptsFromAPI = apiData.data.listPrompts.items;
    setPrompts(promptsFromAPI);
  }

  async function createPrompt(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      prompt: form.get("prompt"),
      description: form.get("description"),
    };
    await API.graphql({
      query: createPromptMutation,
      variables: { input: data },
    });
    fetchPrompts();
    event.target.reset();
  }

  async function deletePrompt({ id }) {
    const newPrompts = prompts.filter((prompt) => prompt.id !== id);
    setPrompts(newPrompts);
    await API.graphql({
      query: deletePromptMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>Promptitude</Heading>
      <View as="form" onSubmit={createPrompt}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Prompt Name"
            label="Prompt Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="prompt"
            placeholder="Prompt Text"
            label="Prompt Text"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Prompt Description"
            label="Prompt Description"
            labelHidden
            variation="quiet"
            required
          />

          <Button type="submit" variation="primary">
            Create Prompt
          </Button>
        </Flex>

        <Heading level={2}>Prompts</Heading>
        <View margin="3rem 0">
          {prompts.map((prompt) => (
            <Flex
              key={prompt.id || prompt.name}
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <Text as="strong" fontWeight={700}>
                {prompt.name}
              </Text>
              <Text as="span">{prompt.prompt}</Text>
              <Text as="span">{prompt.description}</Text>
              <Button variation="link" onClick={() => deletePrompt(prompt)}>
                Delete prompt
              </Button>
            </Flex>
          ))}
        </View>
        <Button onClick={signOut}>Sign Out</Button>
      </View>
    </View>
  );
}

export default withAuthenticator(App);
