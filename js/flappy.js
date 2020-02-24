// Função para criar um novo elemento com a tag e o objeto
function novoElemento(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

// Função para criar uma Barreira com a borda, o corpo e a altura
function Barreira(reversa = false) {
  this.elemento = novoElemento('div', 'barreira');

  const borda = novoElemento('div', 'borda');
  const corpo = novoElemento('div', 'corpo');
  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);
  this.setAltura = (altura) => {
    corpo.style.height = `${altura}px`;
  };
}

/* Função que cria um par de barreiras com a altura randomica,
abertura entre as barreiras e a posição na tela, além das funções
get e set da posição e largura entre as barreiras */
function ParDeBarreiras(altura, abertura, x) {
  this.elemento = novoElemento('div', 'par-de-barreiras');

  this.superior = new Barreira(true);
  this.inferior = new Barreira(false);

  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura);
    const alturaInferior = altura - abertura - alturaSuperior;
    this.superior.setAltura(alturaSuperior);
    this.inferior.setAltura(alturaInferior);
  };

  this.getX = () => parseInt(this.elemento.style.left.split('px')[0], 10);
  this.setX = (_x) => {
    this.elemento.style.left = `${_x}px`;
  };
  this.getLargura = () => this.elemento.clientWidth;

  this.sortearAbertura();
  this.setX(x);
}

/* Função que cria os quatro pares de barreiras que ficará sendo reutilizado com novas
aberturas sorteadas, além da quantidade de pixel de deslocamento na tela */
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new ParDeBarreiras(altura, abertura, largura),
    new ParDeBarreiras(altura, abertura, largura + espaco),
    new ParDeBarreiras(altura, abertura, largura + espaco * 2),
    new ParDeBarreiras(altura, abertura, largura + espaco * 3),
  ];

  const deslocamento = 3;
  this.animar = () => {
    this.pares.forEach((par) => {
      par.setX(par.getX() - deslocamento);

      /* quando o elemento sair da área do jogo colocamos novamente na
      posição inicial e sorteamos nova abertura */
      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length);
        par.sortearAbertura();
      }

      const meio = largura / 2;
      const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio;
      if (cruzouOMeio) notificarPonto();
    });
  };
}

// Função que cria o pássaro e controla o vôo, além dos get e set da posição do mesmo
function Passaro(alturaJogo) {
  let voando = false;

  this.elemento = novoElemento('img', 'passaro');
  this.elemento.src = 'imgs/passaro.png';

  this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0], 10);
  this.setY = (y) => {
    this.elemento.style.bottom = `${y}px`;
  };

  // Teclas para subida ou descida do pássaro
  window.onkeydown = () => {
    voando = true;
  };
  window.onkeyup = () => {
    voando = false;
  };

  this.animar = () => {
    // Testa se está voando para calcular a subida ou descida
    const novoY = this.getY() + (voando ? 8 : -5);
    const alturaMaxima = alturaJogo - this.elemento.clientHeight;

    /* Testa os limites da área do jogo e seta novo valor para altura do pássaro */
    if (novoY <= 0) {
      this.setY(0);
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima);
    } else {
      this.setY(novoY);
    }
  };

  // Seta a posição inicial do pássaro no meio da tela
  this.setY(alturaJogo / 2);
}

// Posiciona e mostra a pontuação na tela
function Progresso() {
  this.elemento = novoElemento('span', 'progresso');
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };
  this.atualizarPontos(0);
}

// Função que verifica se há sobreposição de elementos nos dois eixos para calcular a colisão
function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

// Função que utiliza o "estaoSobrepostos" para configura a colisão
function colidiu(passaro, barreiras) {
  // eslint-disable-next-line no-shadow
  let colidiu = false;
  barreiras.pares.forEach((parDeBarreiras) => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento;
      const inferior = parDeBarreiras.inferior.elemento;
      colidiu = estaoSobrepostos(passaro.elemento, superior)
        || estaoSobrepostos(passaro.elemento, inferior);
    }
  });
  return colidiu;
}

// Função que seta as configurações iniciais do jogo, chamando as funções e inserindo na tela
function FlappyBird() {
  let pontos = 0;

  const areaDoJogo = document.querySelector('[wm-flappy]');
  const altura = areaDoJogo.clientHeight;
  const largura = areaDoJogo.clientWidth;

  const progresso = new Progresso();
  const barreiras = new Barreiras(altura, largura, 200, 400, () => {
    progresso.atualizarPontos((pontos += 1));
  });
  const passaro = new Passaro(altura);

  areaDoJogo.appendChild(progresso.elemento);
  areaDoJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

  this.start = () => {
    // loop do jogo
    const temporizador = setInterval(() => {
      barreiras.animar();
      passaro.animar();

      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
      }
    }, 20);
  };
}

new FlappyBird().start();
