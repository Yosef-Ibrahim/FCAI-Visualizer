export class AlgorithmMetadata {
  constructor({ id, name, category, description, complexity, codeSnippets, explanation }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.description = description;
    this.complexity = complexity;
    this.codeSnippets = codeSnippets;
    this.explanation = explanation;
  }
}
