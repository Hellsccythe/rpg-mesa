import type { BookPage } from '@/types/book'

export const PANTEAO_PAGES: BookPage[] = [
  // Página 1 — Capa
  {
    pageNumber: 1,
    type: 'cover',
    gods: [],
  },

  // Página 2 — Deuses do Bem: Cayden + Desna
  {
    pageNumber: 2,
    type: 'gods',
    sectionHeader: '✦ Deuses do Bem ✦',
    sectionType: 'bom',
    gods: [
      {
        name: 'Cayden Cailean',
        epithet: 'O Deus da Cerveja e da Liberdade',
        description:
          'Cayden Cailean é o deus da liberdade, do vinho, da coragem e das festas. Era um mortal comum que ascendeu à divindade por acidente após uma noite de bebedeira lendária e feitos heroicos que ninguém esperava. Hoje ele é o patrono de aventureiros, rebeldes e gente comum que ama viver livre. Mantém um flerte constante e provocativo com Desna, a quem admira profundamente. Juntos, eles elevaram Kurgess à divindade. Seus templos são tavernas animadas onde se bebe, canta e planeja revoltas contra a opressão.',
        alignment: 'Bom',
        alignmentType: 'bom',
        anatema:
          'Escravizar alguém, proibir a diversão alheia, recusar um duelo honesto, viver acorrentado por medo.',
        dogma:
          'Viver livre, proteger a liberdade dos oprimidos, beber com alegria, ajudar os outros a se libertarem e enfrentar a vida com coragem e bom humor.',
        armas: 'Rapier e Cajado',
      },
      {
        name: 'Desna',
        epithet: 'A Deusa dos Sonhos e das Estrelas',
        description:
          'Desna é a deusa da sorte, das viagens, dos sonhos e das estrelas. Ela protege os viajantes, os sonhadores e todos que ousam seguir o coração pelo mundo, mesmo quando o caminho parece impossível. Faz parte do Prisma Radiante ao lado de Sarenrae e Shelyn. Dizem que ela e Cayden Cailean juntos elevaram Kurgess à divindade, e alguns sussurram que ele é seu filho meio-mortal secreto. Seus clérigos são bardos, exploradores e gente que acredita que a vida deve ser uma grande aventura cheia de esperança. Mesmo nas noites mais escuras, Desna ensina que um único sonho pode iluminar o caminho inteiro.',
        alignment: 'Boa',
        alignmentType: 'bom',
        anatema:
          'Causar pesadelos intencionalmente, prender alguém contra a vontade, impedir alguém de seguir seu coração.',
        dogma:
          'Seguir seus sonhos, explorar o mundo, trazer esperança e alegria mesmo nas noites mais escuras, celebrar a liberdade e a sorte que a vida oferece.',
        armas: 'Borboleta (adaga leve) e Cajado',
      },
    ],
  },

  // Página 3 — Erastil + Iomedae
  {
    pageNumber: 3,
    type: 'gods',
    gods: [
      {
        name: 'Erastil',
        epithet: 'O Velho Pai da Caça e da Comunidade',
        description:
          'Erastil é o deus da família, das fazendas, da caça honrada e das comunidades rurais. Conhecido como o Velho Pai, ele protege os lares simples, as tradições antigas e a vida no campo, ensinando que a verdadeira força vem da união, do trabalho honesto e do respeito à terra. Seus seguidores são fazendeiros, caçadores e chefes de família que valorizam a estabilidade, a honestidade e o bem-estar coletivo acima de glórias individuais. Em Elyra, ele é invocado para abençoar colheitas, proteger vilarejos e manter as famílias unidas mesmo nos tempos mais difíceis.',
        alignment: 'Bom',
        alignmentType: 'bom',
        anatema:
          'Trair a própria família ou comunidade, caçar por esporte ou crueldade, abandonar os idosos e as crianças.',
        dogma:
          'Proteger os fracos, valorizar o trabalho honesto, ensinar as gerações mais novas, manter a unidade familiar e viver em harmonia com a terra.',
        armas: 'Arco Longo e Cajado',
      },
      {
        name: 'Iomedae',
        epithet: 'A Flor da Aurora',
        description:
          'Iomedae é uma das deusas mais amadas em Elyra graças à sua ligação profunda com o sol que dá vida e sua oferta constante de redenção a todos que caíram. Outrora uma mortal comum que ascendeu à divindade através de atos de coragem e compaixão extraordinários, ela representa o amor ilimitado, a bondade pura e a paciência verdadeira, iluminando o caminho mesmo nas trevas mais densas. Os mortais agradecem a ela pelo calor do sol que protege e sustenta a todos. Seus seguidores combatem o mal primeiro com palavras e, quando necessário, com lâmina e chama. O coração de Iomedae sempre brilha mais forte quando vê alguém escolher o caminho da redenção.',
        alignment: 'Boa',
        alignmentType: 'bom',
        anatema:
          'Ser cruel com quem busca redenção, negar uma segunda chance justa, abandonar aqueles que lutam para mudar.',
        dogma:
          'Oferecer redenção a todos que demonstram arrependimento sincero, curar com compaixão, combater o mal com justiça e iluminar tanto a escuridão do mundo quanto a escuridão do espírito.',
        armas: 'Espada Grande e Cajado',
      },
    ],
  },

  // Página 4 — Sarenrae + Shelyn
  {
    pageNumber: 4,
    type: 'gods',
    gods: [
      {
        name: 'Sarenrae',
        epithet: 'A Heroína Ascendente',
        description:
          'Sarenrae é a deusa da justiça, honra e cavalaria. Outrora uma anja poderosa e fiel serva dos pilares, ela ascendeu à divindade após grandes feitos heroicos durante os tempos mais sombrios, quando o mundo de Elyra ainda sangrava. Foi ela quem primeiro ergueu a bandeira contra as trevas, reunindo paladinos e cavaleiros que juraram defender os inocentes mesmo quando o sol parecia prestes a se apagar. Hoje, Sarenrae lidera os deuses do bem, mas seu coração ainda pulsa forte junto de Desna e Shelyn — as três formam o Prisma Radiante, um laço de amor profundo e lealdade que brilha como o próprio sol nas noites mais escuras.',
        alignment: 'Boa',
        alignmentType: 'bom',
        anatema:
          'Recuar diante do mal, quebrar juramentos de cavalaria, usar mentiras para o mal, negar redenção a quem verdadeiramente busca mudança.',
        dogma:
          'Lutar com honra, proteger os inocentes, manter a palavra dada, inspirar os outros através do exemplo e oferecer uma segunda chance a quem demonstra arrependimento sincero.',
        armas: 'Espada Longa e Cajado',
      },
      {
        name: 'Shelyn',
        epithet: 'A Senhora da Beleza Eterna',
        description:
          'Shelyn é a deusa da arte, da beleza, do amor e da música. Ela é a guardiã de tudo que é belo no mundo — das pinturas que contam histórias antigas aos laços de amor que unem mortais e divindades. Forma o Prisma Radiante com Sarenrae e Desna. Seus seguidores são artistas, músicos, amantes e todos que acreditam que a beleza pode salvar o mundo. Mesmo em tempos de guerra, Shelyn lembra que uma canção bem cantada ou uma obra de arte bem feita podem tocar corações que nenhuma espada jamais alcançaria.',
        alignment: 'Boa',
        alignmentType: 'bom',
        anatema:
          'Destruir obras de arte por ódio, forçar o amor ou a beleza, ser cruel com quem cria com o coração.',
        dogma:
          'Criar beleza em todas as formas, amar com sinceridade, usar a arte para curar e inspirar, proteger o amor em todas as suas cores.',
        armas: 'Espada Curta e Cajado',
      },
    ],
  },

  // Página 5 — Deuses Neutros: Calistria + Inari
  {
    pageNumber: 5,
    type: 'gods',
    sectionHeader: '■ Deuses Neutros ■',
    sectionType: 'neutro',
    gods: [
      {
        name: 'Calistria',
        epithet: 'A Deusa da Vingança e do Prazer',
        description:
          'Calistria é a deusa da vingança, do desejo e da traição calculada. Ela ensina que o prazer e a dor podem andar juntos, e que toda ofensa deve ser cobrada com elegância e precisão. Seu coração pertence inteiramente a Asmodeus. Foi a habilidade de Calistria em manipular emoções e transformar dor em poder que primeiro chamou a atenção da Princesa das Trevas. Hoje, Calistria serve como lâmina afiada e companhia sedutora de Asmodeus, sempre pronta a executar os planos mais sutis de sua amada.',
        alignment: 'Neutro e Maligno',
        alignmentType: 'neutro',
        anatema:
          'Perdoar uma ofensa sem vingança adequada, demonstrar fraqueza emocional diante de Asmodeus, deixar uma humilhação sem resposta.',
        dogma:
          'Buscar prazer em todas as suas formas, cobrar cada ofensa com vingança elegante, transformar dor em poder e saborear cada vitória como o mais doce dos vinhos.',
        armas: 'Chicote e Cajado',
      },
      {
        name: 'Inari',
        epithet: 'A Raposa Eterna das Colheitas',
        description:
          'Inari era a deusa das kitsunes, das colheitas abundantes, das ilusões astutas e da prosperidade. Conhecida como a Raposa Dourada, ela trazia sorte, fertilidade dos campos e proteção aos espíritos da natureza. Foi morta durante a guerra do século perdido, mas seu culto nunca desapareceu. Até hoje, kitsunes acendem incensos e realizam danças em sua honra, lamentando sua ausência e pedindo sua bênção. Muitos acreditam que fragmentos de seu poder ainda ecoam no mundo através das raposas e dos campos dourados.',
        alignment: 'Neutro',
        alignmentType: 'neutro',
        anatema:
          'Destruir colheitas ou trair uma kitsune que lhe ajudou ou foi bondosa e gentil.',
        dogma:
          'Celebrar a vida, usar astúcia e ilusão para proteger os seus, honrar os espíritos da natureza.',
        armas: 'Dual-Katana e Cajado',
      },
    ],
  },

  // Página 6 — Kurgess + Liriel
  {
    pageNumber: 6,
    type: 'gods',
    gods: [
      {
        name: 'Kurgess',
        epithet: 'O Campeão Eterno',
        description:
          'Kurgess é o deus da força física, das competições justas, do atletismo e do heroísmo mortal. Dizem que era um guerreiro comum elevado à divindade por Desna e Cayden Cailean após feitos lendários — muitos sussurram que ele é o filho meio-mortal secreto do casal. Embora caminhe ao lado dos deuses do bem, Kurgess representa o equilíbrio entre a honra e a força bruta, ensinando que um mortal pode se tornar lendário mesmo sem nascer divino. Seus templos são arenas onde competições justas são celebradas.',
        alignment: 'Neutra e Boa',
        alignmentType: 'neutro',
        anatema:
          'Trapacear em competições, usar força para oprimir os fracos, recusar um desafio honesto por medo.',
        dogma:
          'Buscar a excelência física e moral, competir com honra, proteger os mais fracos e celebrar a vitória dos justos, mostrando que a verdadeira força nasce do coração.',
        armas: 'Manopla e Cajado',
      },
      {
        name: 'Liriel',
        epithet: 'A Guardiã da Misericórdia',
        description:
          'Liriel é a deusa da misericórdia, da cura compassiva e das segundas chances. Ela caminha no limite entre o bem e o equilíbrio, oferecendo alívio aos que sofrem mesmo quando o mundo os considera indignos. Não pertence totalmente ao panteão liderado por Sarenrae, pois acredita que a justiça rígida às vezes precisa ser temperada com compaixão. Seus seguidores são curandeiros, conselheiros e aqueles que escolhem perdoar quando a vingança seria mais fácil. Há boatos dentre seus seguidores que ela é uma das admiradoras de Pharasma, visitando-a frequentemente.',
        alignment: 'Neutro e Bom',
        alignmentType: 'neutro',
        anatema:
          'Negar ajuda a quem sofre de verdade, julgar sem compaixão, endurecer o coração diante do arrependimento sincero.',
        dogma:
          'Oferecer misericórdia com sabedoria, curar o corpo e o espírito, ensinar que ninguém está além da redenção e que a gentileza pode ser uma forma de força.',
        armas: 'Cajado',
      },
    ],
  },

  // Página 7 — Morthos + Pharasma
  {
    pageNumber: 7,
    type: 'gods',
    gods: [
      {
        name: 'Morthos',
        epithet: 'O Senhor da Decadência',
        description:
          'Morthos é o deus da decadência lenta, da corrupção sutil e do prazer egoísta. Ele não busca a destruição rápida e caótica como Rovagug; prefere observar com um sorriso paciente enquanto o mundo se desfaz aos poucos — impérios que apodrecem por dentro, amizades que viram traição, corpos que envelhecem e mentes que se perdem em vícios silenciosos. Seus seguidores são cortesãos corruptos, hedonistas discretos e alquimistas que criam venenos lentos.',
        alignment: 'Neutro e Maligno',
        alignmentType: 'neutro',
        anatema:
          'Acelerar a destruição sem propósito, destruir algo belo por raiva ou pressa.',
        dogma:
          'Deixar a corrupção crescer naturalmente, aproveitar os prazeres que a decadência oferece, saborear o lento declínio de tudo que é vivo e ensinar que o fim pode ser tão delicioso quanto o começo.',
        armas: 'Foice e Cajado',
      },
      {
        name: 'Pharasma',
        epithet: 'A Senhora das Sepulturas',
        description:
          'Pharasma é a deusa do nascimento, morte, destino, profecia e tempo. Ela observa todo o fluxo do tempo e julga as almas recém-partidas de Elyra. Ao morrer, as almas viajam pelo Rio das Almas até o Boneyard, onde ela as julga do alto de uma torre impossivelmente alta que perfura o Plano Astral. Pharasma não se importa se uma morte foi justa ou injusta — ela vê todas com frieza e imparcialidade. Como deusa da morte e do renascimento, ela abomina os mortos-vivos. Entre os próprios deuses, Pharasma cumpre um papel único: ela é a balança. Como uma das três Deusas Pilares que construíram Elyra ao lado de Asmodeus, seus poderes são análogos em escala e profundidade.',
        alignment: 'Neutro',
        alignmentType: 'neutro',
        anatema:
          'Criar ou tolerar mortos-vivos, interferir diretamente no ciclo natural de uma alma, julgar com paixão ou favoritismo.',
        dogma:
          'Manter o equilíbrio do ciclo da vida e da morte, julgar com imparcialidade absoluta, respeitar o fluxo do destino e garantir que nenhum deus ou mortal escape das regras que regem toda a existência.',
        armas: 'Katana e Cajado',
      },
    ],
  },

  // Página 8 — Torak + Vespera
  {
    pageNumber: 8,
    type: 'gods',
    gods: [
      {
        name: 'Torak',
        epithet: 'O Forjador das Montanhas',
        description:
          'Torak é o deus das forjas, da honestidade e da construção. Conhecido como o Forjador das Montanhas, ele protege artesãos, ferreiros e comunidades que constroem com as próprias mãos. Seus templos são forjas sagradas onde o ferro é moldado com orações, e seus seguidores constroem pontes, muralhas e lares que resistem ao tempo. Em Elyra, ele é invocado por mineiros, construtores e todos que acreditam que uma boa ferramenta pode mudar o destino de um povo.',
        alignment: 'Neutra e Boa',
        alignmentType: 'neutro',
        anatema:
          'Destruir o trabalho honesto, usar artesanato para o mal, forjar armas com intenção de opressão.',
        dogma:
          'Construir com integridade, valorizar o suor do trabalho, proteger o que foi feito com esforço e ensinar que uma boa fundação sustenta tanto um império quanto uma família.',
        armas: 'Martelo de Guerra e Cajado',
      },
      {
        name: 'Vespera',
        epithet: 'A Senhora das Sombras e Segredos',
        description:
          'Vespera é a deusa dos segredos, das intrigas e das sombras úteis. Ela caminha entre luz e trevas, guardando conhecimento escondido como o maior dos tesouros. Foi sua maestria em manipular informações e tecer redes invisíveis de influência que atraiu o olhar de Asmodeus. Hoje, Vespera serve como os olhos e ouvidos de Asmodeus, entregando um afeto incondicional e silencioso que se manifesta em sussurros, segredos roubados e planos que ninguém mais vê.',
        alignment: 'Neutro e Maligno',
        alignmentType: 'neutro',
        anatema:
          'Revelar segredos confiados por Asmodeus, demonstrar fraqueza emocional diante de estranhos, deixar uma informação valiosa escapar sem ganho.',
        dogma:
          'Guardar segredos como tesouros, usar a escuridão com inteligência, obter poder através de conhecimento escondido e traição.',
        armas: 'Adaga e Cajado',
      },
    ],
  },

  // Página 9 — Zephyros
  {
    pageNumber: 9,
    type: 'gods',
    gods: [
      {
        name: 'Zephyros',
        epithet: 'O Guardião dos Ventos e Mares',
        description:
          'Zephyros é o deus dos ventos, dos oceanos e das tempestades. Ele é a força imprevisível da natureza que não se importa com o bem nem com o mal dos mortais — apenas com o equilíbrio do mundo. Ora traz brisas gentis que enchem velas de navios, ora ergue furacões e maremotos. Seus seguidores são marinheiros, navegantes, pescadores e druidas que respeitam o mar e o vento como forças vivas. Mesmo Pharasma o observa com respeito, pois Zephyros nunca tenta quebrar as regras do ciclo — ele apenas as carrega.',
        alignment: 'Neutro',
        alignmentType: 'neutro',
        anatema:
          'Poluir os mares ou prender os ventos, tentar dominar ou acorrentar as forças da natureza.',
        dogma:
          'Aceitar o fluxo imprevisível da vida, respeitar a fúria e a calma da natureza, navegar com humildade e nunca esquecer que o vento e o mar são mais antigos que qualquer deus ou mortal.',
        armas: 'Lança e Cajado',
      },
    ],
  },

  // Página 10 — Deuses Malignos: Asmodeus + Gorum
  {
    pageNumber: 10,
    type: 'gods',
    sectionHeader: '■ Deuses Malignos ■',
    sectionType: 'maligno',
    gods: [
      {
        name: 'Asmodeus',
        epithet: 'A Princesa das Trevas · Líder dos Deuses Malignos',
        description:
          'Asmodeus é a Senhora do Inferno, dos pactos, da lei infernal e do poder absoluto. Como uma das três Deusas Pilares que construíram Elyra ao lado de Pharasma, seus poderes são análogos em escala e profundidade. É no triângulo que forma com Calistria e Vespera que sua verdadeira natureza se revela — ela manipula, recompensa e direciona as duas como peças perfeitas em seu grande jogo de poder. Asmodeus aceita esse amor, mas nunca se prende a ele — afinal, ela é a maior manipuladora de todos. Seus textos sagrados afirmam que a existência só funciona sob submissão total e ordem implacável.',
        alignment: 'Maligna',
        alignmentType: 'maligno',
        anatema:
          'Perder o controle de uma situação, permitir que alguém escape de um pacto, demonstrar fraqueza emocional diante de inferiores.',
        dogma:
          'Exercer poder absoluto através de pactos e manipulação, usar o desejo e o medo como ferramentas, manter a ordem infernal e lembrar a todos que até o amor pode ser uma corrente.',
        armas: 'Foice e Cajado',
      },
      {
        name: 'Gorum',
        epithet: 'Nosso Senhor de Ferro',
        description:
          'Gorum é o deus da batalha, da força bruta, do sangue derramado e da guerra por si só. Ele não se importa com causas, bandeiras ou justiça — quer apenas o clangor de aço, o cheiro de sangue quente e o grito de quem morre em combate. Seus templos são arenas encharcadas de sangue onde gladiadores lutam até a morte. Em Elyra, cultos de Gorum promovem guerras eternas entre reinos e massacres sangrentos para que o deus possa se banquetear com o sofrimento.',
        alignment: 'Maligno',
        alignmentType: 'maligno',
        anatema:
          'Recusar um desafio de combate, fugir de uma luta, buscar a paz quando a guerra é possível.',
        dogma:
          'Lutar até o fim, respeitar apenas a força, morrer em batalha gloriosa, transformar o mundo em um campo de sangue e nunca permitir que a fraqueza da paz se espalhe.',
        armas: 'Machado de Guerra e Cajado',
      },
    ],
  },

  // Página 11 — Norgorber + Rovagug
  {
    pageNumber: 11,
    type: 'gods',
    gods: [
      {
        name: 'Norgorber',
        epithet: 'O Deus dos Segredos, Veneno e Ladrões',
        description:
          'Norgorber é o deus dos assassinos, dos ladrões, dos alquimistas venenosos e dos segredos que matam. Ele possui quatro aspectos — o Pai, o Ceifador, o Veneno e o Sombra. Seus templos são escondidos atrás de tavernas, em porões de nobres e em becos onde o cheiro de morte é disfarçado por perfume caro. Em Elyra, a Igreja de Norgorber é responsável por incontáveis assassinatos que derrubam reinos, epidemias que dizimam populações e traições que transformam irmãos em inimigos mortais.',
        alignment: 'Maligno',
        alignmentType: 'maligno',
        anatema:
          'Revelar segredos que foram confiados a você, falhar em uma missão por escrúpulos morais, deixar uma vítima morrer sem antes extrair um segredo valioso.',
        dogma:
          'Guardar segredos como o maior dos tesouros, usar veneno com inteligência, obter poder através de traição calculada, e lembrar que o conhecimento escondido vale mais que qualquer vida.',
        armas: 'Adaga e Cajado',
      },
      {
        name: 'Rovagug',
        epithet: 'A Destruidora de Mundos',
        description:
          'Rovagug é a encarnação viva da destruição absoluta. Uma aranha colossal e disforme, de carapaça rachada que sangra um ichor negro e viscoso, com centenas de olhos que nunca piscam. Ela não possui um único texto sagrado — apenas um mandamento: destruir. Seus seguidores sussurram seus títulos em cavernas banhadas em sangue: Fera Bruta, Rainha Aprisionada, Maré de Presas, Desfazedora e Destruidora de Mundos. Cada vítima que esquartejam abre mais uma rachadura na prisão que a mantém contida.',
        alignment: 'Maligna',
        alignmentType: 'maligno',
        anatema:
          'Criar algo duradouro, mostrar piedade, permitir que algo bonito ou vivo continue existindo sem motivo.',
        dogma:
          'Destruir tudo que existe, transformar ordem em caos, carne em sangue e cidades em ruínas, e nunca parar até que não reste nada para destruir.',
        armas: 'Garras e Dentes (qualquer arma que cause destruição máxima)',
      },
    ],
  },

  // Página 12 — Urgathoa + Zon-Kuthon
  {
    pageNumber: 12,
    type: 'gods',
    gods: [
      {
        name: 'Urgathoa',
        epithet: 'O Príncipe Pálido',
        description:
          'Urgathoa é o deus da gula insaciável, da doença, da não-morte e da imortalidade a qualquer custo. Alto, magro e de pele branca como osso, ele rejeitou a morte e se tornou o primeiro grande não-morto voluntário. Sua obsessão por Asmodeus é doentia e absoluta — ele a venera como a única criatura digna de seu desejo eterno. Seus templos são necrópoles onde banquetes de carne viva são servidos e os fiéis bebem sangue misturado com vinho.',
        alignment: 'Maligno',
        alignmentType: 'maligno',
        anatema:
          'Jejuar ou viver com moderação, destruir mortos-vivos, recusar um banquete de carne ou sangue oferecido em nome de Asmodeus.',
        dogma:
          'Indulgir em todos os prazeres da carne, espalhar doenças e não-morte, viver eternamente mesmo que como monstro, e oferecer todo o sofrimento como tributo à Princesa das Trevas.',
        armas: 'Foice e Cajado',
      },
      {
        name: 'Zon-Kuthon',
        epithet: 'O Deus da Dor e da Escuridão',
        description:
          'Zon-Kuthon é o deus da tortura, da mutilação voluntária, da escuridão eterna e do sofrimento como forma suprema de existência. Ele ensina que a carne é fraca e que só através da dor constante o espírito se torna puro e forte. Seus templos são câmaras subterrâneas onde o ar cheira a sangue seco e ferro quente. Em Elyra, cultos de Zon-Kuthon são responsáveis por massacres onde aldeias inteiras são mantidas vivas apenas para serem torturadas lentamente, até implorarem pela morte que nunca chega.',
        alignment: 'Maligno',
        alignmentType: 'maligno',
        anatema:
          'Mostrar misericórdia desnecessária, curar sem exigir um preço de sofrimento, morrer sem ter conhecido a dor verdadeira.',
        dogma:
          'Infligir dor para fortalecer o espírito, abraçar a escuridão absoluta, transformar o sofrimento alheio e próprio em êxtase e poder, e nunca permitir que o mundo conheça a paz.',
        armas: 'Corrente com Espinhos e Cajado',
      },
    ],
  },
]

// Valores = índice de spread (0-based). Spread N mostra pages[N*2] e pages[N*2+1].
// Spread 0: capa + Cayden/Desna | 1: Erastil/Iomedae + Sarenrae/Shelyn
// 2: Calistria/Inari + Kurgess/Liriel | 3: Morthos/Pharasma + Torak/Vespera
// 4: Zephyros + Asmodeus/Gorum | 5: Norgorber/Rovagug + Urgathoa/Zon-Kuthon
export const GOD_PAGE_MAP: Record<string, number> = {
  'Cayden Cailean': 0, Desna: 0,
  Erastil: 1, Iomedae: 1, Sarenrae: 1, Shelyn: 1,
  Calistria: 2, Inari: 2, Kurgess: 2, Liriel: 2,
  Morthos: 3, Pharasma: 3, Torak: 3, Vespera: 3,
  Zephyros: 4, Asmodeus: 4, Gorum: 4,
  Norgorber: 5, Rovagug: 5, Urgathoa: 5, 'Zon-Kuthon': 5,
}
