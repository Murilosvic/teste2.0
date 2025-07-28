const somColisao = new Audio("colisao.wav"); // Substitua pelo nome do seu arquivo
somColisao.preload = "auto";

// Função chamada no botão de início (libera som em navegadores modernos)
function liberarAudio() {
  somColisao.play();
  somColisao.pause();
}
