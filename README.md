# Idea

Consider the following manual test case:

```text
- Open the app
- Click on the 'Projects' icon
- Wait for the 'Neural Networks' project to appear
- Click on 'Learn more' on the 'Neural Networks' project card
```

Our main program will read this step by step, and for each step it will call the Selector Grounding module to get the
selector for the described element.

Pseudo code:

```ts
for (step in test_case) {
    element_description = parse_step(step);
    selector = SG(dom, element_description);
    perform_action(selector);
}
```

## Selector grounding

> This is the llm part

- It accepts a dom structure and an element description
- It outputs a selector that matches the described element in the dom

```ts
SG(dom, element_description) -> selector
```

## Peform actions in the browser

> This the chrome devtools part

- It accepts a selector and performs the action (click, wait, etc) on the matched element
