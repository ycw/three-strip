export class GeometryHasDisposedError extends Error {
  constructor() {
    super('Buffer geometry has been disposed internally');
  }
}

export class DependencyInjectionError extends Error {
  constructor() {
    super('Missing threejs lib; please assign it to `Strip.THREE`');
  }
}