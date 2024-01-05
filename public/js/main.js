function mostrarProductos(categoria) {
    var urlDestino = '/productos?categoria=' + categoria;

    // Redirige a la nueva páginas
    window.location.href = urlDestino;
  }