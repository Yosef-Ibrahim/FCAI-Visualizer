export class Algorithm {
  constructor() {
    if (this.constructor === Algorithm) {
      throw new Error('Algorithm is abstract — extend it');
    }
  }

  get id() { throw new Error('Implement id getter'); }
  get name() { throw new Error('Implement name getter'); }
  get category() { throw new Error('Implement category getter'); }
  get complexity() { throw new Error('Implement complexity getter'); }
  get codeSnippets() { throw new Error('Implement codeSnippets getter'); }
  get explanation() { throw new Error('Implement explanation getter'); }

  generateSteps(input) {
    throw new Error('Implement generateSteps(input)');
  }

  getDefaultInput() {
    throw new Error('Implement getDefaultInput()');
  }
}
