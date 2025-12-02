# Selector Grounding

> Given an element's description in natural language, find the best possible css selector that matches the element in the DOM.
This is useful in generating automation scripts from manual tests

Consider the following manual test case:

```text
- Open the app
- Click on the 'Projects' icon
- Wait for the 'Neural Networks' project to appear
- Click on 'Learn more' on the 'Neural Networks' project card
```

Read the manual test step by step, and for each step it will call the Selector Grounding module to get the selector for the described element.

Pseudo code:

```ts
for (step in test_case) {
    element_description = parse_step(step);
    selector = SG(dom, element_description);
    perform_action(selector);
}
```

## Selector grounding

- It accepts a dom structure and an element description
- It outputs a selector that matches the described element in the dom

```ts
SG(dom, element_description) -> selector
```

### Idea

- `DOM Snapshot`: Use CDP (Chrome DevTools Protocol) to take the DOM snapshot of the page
- `Semantic DOM`: Convert snapshot to a minimal structured format
- `Chunking`: We eventually feed it to the llm. So, it's better to chunk it
- `Chunk Ranking`: Rank the chunks based on relevance to the element description
- `Grounding`: Use the top ranked chunks to generate the best possible node in the snapshot
- `Resolve Selector`: Convert the snapshot node to an actual css selector


#### Todo

- [ ] Logger
- [ ] Rethink Chunking
    - If the element description only has text and the document has multiple nodes with the same text in different places, llm is picking up the wrong element.
    - Both of those chucks will probably have the same score. So, the selector derived from the first chunk wins.
    - Should we generate selectors from all the top chunks and use another llm step to pick the best one using the description again? (Sounds like a good idea to me)
    - Or just use the whole dom without chunking?

