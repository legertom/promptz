import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
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
  updatePrompt as updatePromptMutation,
} from "./graphql/mutations";

function App({ signOut }) {
  const [prompts, setPrompts] = useState([]);
  const [formValues, setFormValues] = useState({
    name: "",
    prompt: "",
    description: "",
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    const apiData = await API.graphql({
      query: listPrompts,
      variables: { limit: 100 },
    });
    const promptsFromAPI = apiData.data.listPrompts.items;
    const sortedPrompts = promptsFromAPI.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setPrompts(sortedPrompts);
  }

  async function createPrompt(event) {
    event.preventDefault();
    const data = {
      name: formValues.name,
      prompt: formValues.prompt,
      description: formValues.description,
    };

    if (editingPromptId) {
      // Update the existing prompt
      const promptToUpdate = prompts.find(
        (prompt) => prompt.id === editingPromptId
      );
      await API.graphql({
        query: updatePromptMutation,
        variables: {
          input: {
            id: editingPromptId,
            ...data,
          },
        },
      });
      setEditingPromptId(null);
    } else {
      // Create a new prompt
      await API.graphql({
        query: createPromptMutation,
        variables: { input: data },
      });
    }

    fetchPrompts();
    setFormValues({ name: "", prompt: "", description: "" });
  }

  const [editingPromptId, setEditingPromptId] = useState(null);

  const editPrompt = (id) => {
    setEditingPromptId(id);
  };

  async function deletePrompt({ id }) {
    const newPrompts = prompts.filter((prompt) => prompt.id !== id);
    setPrompts(newPrompts);
    await API.graphql({
      query: deletePromptMutation,
      variables: { input: { id } },
    });
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (editingPromptId !== null) {
      setPrompts((prevPrompts) =>
        prevPrompts.map((prompt) => {
          if (prompt.id === editingPromptId) {
            return {
              ...prompt,
              [name]: value,
            };
          } else {
            return prompt;
          }
        })
      );
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
  };

  async function updatePrompt(id) {
    const promptToUpdate = prompts.find((prompt) => prompt.id === id);
    await API.graphql({
      query: updatePromptMutation,
      variables: {
        input: {
          id: id,
          name: promptToUpdate.name,
          prompt: promptToUpdate.prompt,
          description: promptToUpdate.description,
        },
      },
    });
    setEditingPromptId(null);
  }

  function cancelEditPrompt() {
    setEditingPromptId(null);
    setFormValues({ name: "", prompt: "", description: "" });
  }

  function cancelEdit() {
    setEditingPromptId(null);
    setFormValues({});
  }
  

  return (
    <div className="app">
      <h1>Promptitude</h1>

      <form onSubmit={createPrompt}>
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="Prompt Name"
            aria-label="Prompt Name"
            value={formValues.name}
            required
            onChange={handleEditInputChange}
          />
          <input
            type="text"
            name="prompt"
            placeholder="Prompt"
            aria-label="Prompt"
            value={formValues.prompt}
            required
            onChange={handleEditInputChange}
          />
          <input
            type="text"
            name="description"
            placeholder="Prompt Desc"
            aria-label="Prompt Desc"
            value={formValues.description}
            required
            onChange={handleEditInputChange}
          />

          <button type="submit">Create Prompt</button>
        </div>

        <h2>Prompts</h2>
        <div className="prompts">
          {prompts.map((prompt) => (
            <div key={prompt.id || prompt.name} className="prompt-row">
              <div className="prompt-title">
                {editingPromptId === prompt.id ? (
                  <input
                    type="text"
                    name="name"
                    value={prompt.name}
                    onChange={(e) => handleEditInputChange(e, prompt.id)}
                  />
                ) : (
                  prompt.name
                )}
              </div>
              <div className="prompt-text">
                {editingPromptId === prompt.id ? (
                  <textarea
                    name="prompt"
                    value={prompt.prompt}
                    
                    cols={60}
                    onChange={(e) => handleEditInputChange(e, prompt.id)}
                  />
                ) : (
                  
                  prompt.prompt
                   
                )}
              </div>
              <div className="prompt-description">
                {editingPromptId === prompt.id ? (
                  <input
                    type="text"
                    name="description"
                    value={prompt.description}
                    onChange={(e) => handleEditInputChange(e, prompt.id)}
                  />
                ) : (
                  prompt.description
                )}
              </div>

              <div className="prompt-actions">
  {editingPromptId === prompt.id ? (
    <>
      <button
        className="update-prompt"
        onClick={() => updatePrompt(prompt.id)}
      >
        Update prompt
      </button>
      {/* <button
        className="cancel-prompt"
        onClick={cancelEdit}
      >
        Cancel
      </button> */}
    </>
  ) : (
    <>
      <button
        className="edit-prompt"
        onClick={() => editPrompt(prompt.id)}
      >
        Edit prompt
      </button>
      <button
        className="delete-prompt"
        onClick={() => deletePrompt(prompt)}
      >
        Delete prompt
      </button>
    </>
  )}
</div>



            </div>
          ))}
        </div>
        <button onClick={signOut}>Sign Out</button>
      </form>
    </div>
  );
}

export default withAuthenticator(App);
