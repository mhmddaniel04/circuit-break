// Bit's answer bank: common questions answered instantly, without the internet or the AI.
// To add one: give it word groups that must ALL appear in the question (any word of a group
// counts, so list synonyms in English and Bahasa Melayu), and an answer in both languages.

interface FaqEntry {
  id: string;
  /** Every group must match one word of the question. Words of 4+ letters also match longer words. */
  groups: string[][];
  /** The question must not contain these words (they belong to a different answer). */
  not?: string[];
  answer: { en: string; ms: string };
}

export const FAQ: FaqEntry[] = [
  {
    id: 'binary',
    groups: [
      ['computer', 'komputer', 'binary', 'binari'],
      ['0', '1', 'zero', 'one', 'sifar', 'satu', 'binary', 'binari'],
    ],
    answer: {
      en: 'A computer is made of billions of tiny switches called transistors. Each switch is either ON or OFF, never half. We write ON as 1 and OFF as 0, so everything a computer does is built from 0s and 1s. This is called binary.',
      ms: 'Komputer dibina daripada berbilion suis kecil yang dipanggil transistor. Setiap suis sama ada HIDUP atau MATI, tidak pernah separuh. HIDUP ditulis 1 dan MATI ditulis 0, jadi semua kerja komputer dibina daripada 0 dan 1. Ini dipanggil binari.',
    },
  },
  {
    id: 'logicGate',
    groups: [
      ['logic', 'logik'],
      ['gate', 'get'],
    ],
    not: ['and', 'or', 'not', 'nand', 'nor', 'xor', 'universal', 'combinational', 'gabungan'],
    answer: {
      en: 'A logic gate is a tiny circuit that takes one or two inputs (0 or 1) and gives one output (0 or 1) by following a rule. The six gates are NOT, AND, OR, NAND, NOR and XOR. Joining gates together builds everything a computer does.',
      ms: 'Get logik ialah litar kecil yang menerima satu atau dua input (0 atau 1) dan memberi satu output (0 atau 1) mengikut satu peraturan. Enam get itu ialah NOT, AND, OR, NAND, NOR dan XOR. Menyambung get bersama membina semua kerja komputer.',
    },
  },
  {
    id: 'notInverter',
    groups: [['not'], ['invert', 'songsang', 'penyongsang']],
    answer: {
      en: 'NOT is called an inverter because it inverts (flips) the signal: 1 becomes 0 and 0 becomes 1. Example: a night light turns ON when it is NOT bright outside.\nA | Y\n0 | 1\n1 | 0',
      ms: 'NOT dipanggil penyongsang kerana ia menyongsangkan isyarat: 1 menjadi 0 dan 0 menjadi 1. Contoh: lampu malam menyala apabila keadaan TIDAK terang.\nA | Y\n0 | 1\n1 | 0',
    },
  },
  {
    id: 'notChain',
    groups: [
      ['not'],
      [
        'three',
        '3',
        'tiga',
        'two',
        '2',
        'dua',
        'chain',
        'rantai',
        'row',
        'turut',
        'many',
        'banyak',
        'odd',
        'ganjil',
        'even',
        'genap',
      ],
    ],
    answer: {
      en: 'Each NOT flips the signal once. Two NOTs flip it twice, so you get the input back. Three NOTs flip it three times, so the output is the opposite of the input. Rule: an odd number of NOTs flips the signal, an even number keeps it the same.',
      ms: 'Setiap NOT menyongsangkan isyarat sekali. Dua NOT menyongsangkan dua kali, jadi anda mendapat semula input asal. Tiga NOT menyongsangkan tiga kali, jadi output ialah songsangan input. Peraturan: bilangan NOT ganjil menyongsangkan isyarat, bilangan genap mengekalkannya.',
    },
  },
  {
    id: 'notWhat',
    groups: [['not'], ['gate', 'get']],
    not: ['nand', 'nor', 'and', 'or', 'xor'],
    answer: {
      en: 'The NOT gate has one input and flips it: 1 becomes 0 and 0 becomes 1. Its Boolean expression is Y = Ā (A with a bar on top).\nA | Y\n0 | 1\n1 | 0',
      ms: 'Get NOT mempunyai satu input dan menyongsangkannya: 1 menjadi 0 dan 0 menjadi 1. Ungkapan Booleannya ialah Y = Ā (A dengan garis di atas).\nA | Y\n0 | 1\n1 | 0',
    },
  },
  {
    id: 'andExample',
    groups: [['and'], ['example', 'contoh', 'real', 'life', 'kehidupan', 'daily', 'harian']],
    not: ['or', 'xor', 'nand', 'nor'],
    answer: {
      en: 'A car starts only when you press the start button AND your foot is on the brake. A bank safe opens only when key A AND key B are both turned. Both conditions must be true at the same time, just like AND.',
      ms: 'Kereta hanya hidup apabila anda menekan butang mula DAN kaki menekan brek. Peti besi bank hanya terbuka apabila kunci A DAN kunci B kedua-duanya dipulas. Kedua-dua syarat mesti benar pada masa yang sama, sama seperti AND.',
    },
  },
  {
    id: 'andDot',
    groups: [['dot', 'titik']],
    answer: {
      en: 'The dot means AND. Y = A · B is read "A AND B": Y is 1 only when A and B are both 1. It looks like multiplying, and it works the same way with 0 and 1: anything times 0 is 0.',
      ms: 'Titik bermaksud AND. Y = A · B dibaca "A AND B": Y ialah 1 hanya apabila A dan B kedua-duanya 1. Ia kelihatan seperti darab, dan berfungsi sama dengan 0 dan 1: apa-apa darab 0 ialah 0.',
    },
  },
  {
    id: 'andThree',
    groups: [['and'], ['three', '3', 'tiga']],
    not: ['or', 'xor', 'nand', 'nor', 'truth', 'kebenaran'],
    answer: {
      en: 'Chain two AND gates: the first checks A and B, and the second checks that result and C. So Y = A · B · C is 1 only when all three inputs are 1. Out of 8 rows in the truth table, only one row (1, 1, 1) gives 1.',
      ms: 'Rantaikan dua get AND: get pertama memeriksa A dan B, dan get kedua memeriksa hasil itu dan C. Jadi Y = A · B · C ialah 1 hanya apabila ketiga-tiga input ialah 1. Daripada 8 baris jadual kebenaran, hanya satu baris (1, 1, 1) memberi 1.',
    },
  },
  {
    id: 'andWhat',
    groups: [['and'], ['gate', 'get']],
    not: ['or', 'xor', 'nand', 'nor', 'example', 'contoh', 'three', 'tiga', 'not'],
    answer: {
      en: 'The AND gate gives 1 only when ALL its inputs are 1. If even one input is 0, the output is 0. Its Boolean expression is Y = A · B.\nA B | Y\n0 0 | 0\n0 1 | 0\n1 0 | 0\n1 1 | 1',
      ms: 'Get AND memberi 1 hanya apabila SEMUA input ialah 1. Jika satu input sahaja ialah 0, output ialah 0. Ungkapan Booleannya ialah Y = A · B.\nA B | Y\n0 0 | 0\n0 1 | 0\n1 0 | 0\n1 1 | 1',
    },
  },
  {
    id: 'onePlusOne',
    groups: [['oneplusone', 'plus', 'tambah']],
    not: ['adder', 'penambah', 'half', 'separuh', 'bracket', 'kurungan'],
    answer: {
      en: 'In logic, + means OR, not adding. A + B is 1 when at least one input is 1. So 1 + 1 = 1, because "1 OR 1" is still just 1 (ON). Adding numbers in binary is a different thing, done by a half adder.',
      ms: 'Dalam logik, + bermaksud OR, bukan tambah. A + B ialah 1 apabila sekurang-kurangnya satu input ialah 1. Jadi 1 + 1 = 1, kerana "1 OR 1" masih 1 (HIDUP). Menambah nombor dalam binari ialah perkara lain, dilakukan oleh penambah separuh.',
    },
  },
  {
    id: 'andVsOr',
    groups: [
      ['and'],
      ['or'],
      [
        'differ',
        'difference',
        'beza',
        'berbeza',
        'perbezaan',
        'vs',
        'versus',
        'compare',
        'banding',
      ],
    ],
    not: ['xor', 'nand', 'nor'],
    answer: {
      en: 'AND is strict: it needs ALL inputs to be 1. OR is easy-going: it needs just ONE input to be 1. In a truth table, AND has only one row that gives 1 (all 1s), while OR has only one row that gives 0 (all 0s).',
      ms: 'AND tegas: ia memerlukan SEMUA input bernilai 1. OR mudah: ia hanya memerlukan SATU input bernilai 1. Dalam jadual kebenaran, AND hanya ada satu baris yang memberi 1 (semua 1), manakala OR hanya ada satu baris yang memberi 0 (semua 0).',
    },
  },
  {
    id: 'orVsXor',
    groups: [
      ['xor'],
      ['or'],
      [
        'differ',
        'difference',
        'beza',
        'berbeza',
        'perbezaan',
        'vs',
        'versus',
        'compare',
        'banding',
      ],
    ],
    answer: {
      en: 'They differ in only one row: when both inputs are 1. OR gives 1 ("at least one"), but XOR gives 0 ("exactly one", the inputs must be different).\nA B | OR XOR\n0 0 | 0  0\n0 1 | 1  1\n1 0 | 1  1\n1 1 | 1  0',
      ms: 'Bezanya hanya pada satu baris: apabila kedua-dua input ialah 1. OR memberi 1 ("sekurang-kurangnya satu"), tetapi XOR memberi 0 ("tepat satu", input mesti berbeza).\nA B | OR XOR\n0 0 | 0  0\n0 1 | 1  1\n1 0 | 1  1\n1 1 | 1  0',
    },
  },
  {
    id: 'orExample',
    groups: [['or'], ['example', 'contoh', 'real', 'life', 'kehidupan', 'daily', 'harian']],
    not: ['and', 'xor', 'nand', 'nor'],
    answer: {
      en: 'A doorbell rings when someone presses the front button OR the back button (or both). A car alarm goes off when a door OR a window opens. One condition is enough, just like OR.',
      ms: 'Loceng pintu berbunyi apabila seseorang menekan butang hadapan ATAU butang belakang (atau kedua-duanya). Penggera kereta berbunyi apabila pintu ATAU tingkap dibuka. Satu syarat sudah cukup, sama seperti OR.',
    },
  },
  {
    id: 'orWhat',
    groups: [['or'], ['gate', 'get']],
    not: ['and', 'xor', 'nand', 'nor', 'example', 'contoh', 'not'],
    answer: {
      en: 'The OR gate gives 1 when AT LEAST ONE input is 1. The output is 0 only when every input is 0. Its Boolean expression is Y = A + B.\nA B | Y\n0 0 | 0\n0 1 | 1\n1 0 | 1\n1 1 | 1',
      ms: 'Get OR memberi 1 apabila SEKURANG-KURANGNYA SATU input ialah 1. Output ialah 0 hanya apabila setiap input ialah 0. Ungkapan Booleannya ialah Y = A + B.\nA B | Y\n0 0 | 0\n0 1 | 1\n1 0 | 1\n1 1 | 1',
    },
  },
  {
    id: 'xorWhat',
    groups: [['xor', 'exclusive', 'eksklusif']],
    answer: {
      en: 'XOR (exclusive OR) gives 1 when the inputs are DIFFERENT and 0 when they are the same. Example: a stair light with two switches, where flipping either switch changes the light. Expression: Y = A ⊕ B.\nA B | Y\n0 0 | 0\n0 1 | 1\n1 0 | 1\n1 1 | 0',
      ms: 'XOR (OR eksklusif) memberi 1 apabila input BERBEZA dan 0 apabila input sama. Contoh: lampu tangga dengan dua suis, di mana menukar mana-mana suis mengubah lampu. Ungkapan: Y = A ⊕ B.\nA B | Y\n0 0 | 0\n0 1 | 1\n1 0 | 1\n1 1 | 0',
    },
  },
  {
    id: 'universal',
    groups: [
      ['nand', 'nor'],
      ['universal', 'sejagat'],
    ],
    answer: {
      en: 'NAND is called a universal gate because you can build EVERY other gate using only NAND gates. Join both inputs of a NAND together and it works like NOT; add more NANDs to make AND, OR and the rest. Real chips are often built mostly from NAND gates.',
      ms: 'NAND dipanggil get universal kerana anda boleh membina SETIAP get lain menggunakan get NAND sahaja. Sambung kedua-dua input NAND bersama dan ia berfungsi seperti NOT; tambah lebih banyak NAND untuk membuat AND, OR dan yang lain. Cip sebenar selalunya dibina kebanyakannya daripada get NAND.',
    },
  },
  {
    id: 'nandWhat',
    groups: [['nand']],
    answer: {
      en: 'NAND means NOT AND: an AND gate followed by a NOT. It gives 0 only when ALL inputs are 1, and 1 otherwise.\nA B | Y\n0 0 | 1\n0 1 | 1\n1 0 | 1\n1 1 | 0',
      ms: 'NAND bermaksud NOT AND: get AND diikuti get NOT. Ia memberi 0 hanya apabila SEMUA input ialah 1, dan 1 dalam keadaan lain.\nA B | Y\n0 0 | 1\n0 1 | 1\n1 0 | 1\n1 1 | 0',
    },
  },
  {
    id: 'norWhat',
    groups: [['nor']],
    answer: {
      en: 'NOR means NOT OR: an OR gate followed by a NOT. It gives 1 only when ALL inputs are 0, and 0 otherwise.\nA B | Y\n0 0 | 1\n0 1 | 0\n1 0 | 0\n1 1 | 0',
      ms: 'NOR bermaksud NOT OR: get OR diikuti get NOT. Ia memberi 1 hanya apabila SEMUA input ialah 0, dan 0 dalam keadaan lain.\nA B | Y\n0 0 | 1\n0 1 | 0\n1 0 | 0\n1 1 | 0',
    },
  },
  {
    id: 'truthTableHow',
    groups: [
      ['truth', 'kebenaran'],
      ['table', 'jadual'],
      [
        '3',
        'three',
        'tiga',
        'row',
        'baris',
        'how',
        'bagaimana',
        'make',
        'bina',
        'build',
        'many',
        'berapa',
      ],
    ],
    answer: {
      en: 'Rows = 2 to the power of the number of inputs: 1 input gives 2 rows, 2 inputs give 4, 3 inputs give 8. List the inputs in binary order: 000, 001, 010, 011, 100, 101, 110, 111. Then work out each middle wire (P, Q) column by column, and finally Y.',
      ms: 'Bilangan baris = 2 kuasa bilangan input: 1 input memberi 2 baris, 2 input memberi 4, 3 input memberi 8. Senaraikan input mengikut susunan binari: 000, 001, 010, 011, 100, 101, 110, 111. Kemudian kira setiap wayar tengah (P, Q) lajur demi lajur, dan akhirnya Y.',
    },
  },
  {
    id: 'truthTableWhat',
    groups: [
      ['truth', 'kebenaran'],
      ['table', 'jadual'],
    ],
    answer: {
      en: 'A truth table lists every possible combination of inputs, and the output for each one. It shows exactly how a gate or circuit behaves. For example, the AND table has 4 rows and only the last row (1, 1) gives 1.',
      ms: 'Jadual kebenaran menyenaraikan setiap gabungan input yang mungkin, dan output bagi setiap satu. Ia menunjukkan dengan tepat bagaimana get atau litar berfungsi. Contohnya, jadual AND ada 4 baris dan hanya baris terakhir (1, 1) memberi 1.',
    },
  },
  {
    id: 'brackets',
    groups: [['bracket', 'kurungan', 'order', 'susunan', 'parenthes']],
    answer: {
      en: 'Just like in maths, work out the brackets first. (A · B) + C means "A and B, or C", but (A + B) · C means "A or B, and C". With A = 0, B = 0, C = 1 the first gives 1 and the second gives 0. In a circuit, the brackets are the gates closest to the inputs.',
      ms: 'Sama seperti matematik, selesaikan kurungan dahulu. (A · B) + C bermaksud "A dan B, atau C", tetapi (A + B) · C bermaksud "A atau B, dan C". Dengan A = 0, B = 0, C = 1 yang pertama memberi 1 dan yang kedua memberi 0. Dalam litar, kurungan ialah get yang paling dekat dengan input.',
    },
  },
  {
    id: 'circuitOutput',
    groups: [
      ['output'],
      ['circuit', 'litar'],
      ['find', 'cari', 'work', 'kira', 'calculate', 'how', 'bagaimana', 'get', 'dapat'],
    ],
    answer: {
      en: 'Go from left to right. Write the input values (0 or 1) on the wires, work out the output of the first gate, write it on its wire, and use it as the input of the next gate. Keep going until you reach the output Y. Label middle wires P, Q, R to stay organised.',
      ms: 'Bergerak dari kiri ke kanan. Tulis nilai input (0 atau 1) pada wayar, kira output get pertama, tulis pada wayarnya, dan gunakannya sebagai input get seterusnya. Teruskan sehingga sampai ke output Y. Labelkan wayar tengah P, Q, R supaya teratur.',
    },
  },
  {
    id: 'sentence',
    groups: [
      ['sentence', 'ayat', 'word', 'perkataan', 'story', 'cerita'],
      ['gate', 'get', 'circuit', 'litar', 'turn', 'tukar', 'convert'],
    ],
    answer: {
      en: 'Look for key words: "and" or "both" means AND; "or", "either" or "any" means OR; "not", "unless" or "off" means NOT. Example: "The fan is on when the switch is on AND the room is NOT cold" becomes Y = A · B̄.',
      ms: 'Cari kata kunci: "dan" atau "kedua-dua" bermaksud AND; "atau", "salah satu" atau "mana-mana" bermaksud OR; "tidak", "kecuali" atau "mati" bermaksud NOT. Contoh: "Kipas hidup apabila suis dihidupkan DAN bilik TIDAK sejuk" menjadi Y = A · B̄.',
    },
  },
  {
    id: 'combinational',
    groups: [['combinational', 'gabungan', 'combine', 'gabung']],
    answer: {
      en: 'A combinational circuit is several gates joined together, where the output depends only on the inputs right now (it has no memory). Every circuit in Circuit Break is a combinational circuit, like Y = (A + B) · C.',
      ms: 'Litar gabungan ialah beberapa get yang disambung bersama, di mana output hanya bergantung pada input pada masa itu (ia tiada ingatan). Setiap litar dalam Circuit Break ialah litar gabungan, seperti Y = (A + B) · C.',
    },
  },
  {
    id: 'halfAdder',
    groups: [['adder', 'penambah']],
    answer: {
      en: 'A half adder adds two bits. Sum S = A ⊕ B (XOR) and carry C = A · B (AND). For 1 + 1: S = 0 and C = 1, which is 10 in binary (two). This is how a computer adds numbers!\nA B | S C\n0 0 | 0 0\n0 1 | 1 0\n1 0 | 1 0\n1 1 | 0 1',
      ms: 'Penambah separuh menambah dua bit. Hasil tambah S = A ⊕ B (XOR) dan bawa C = A · B (AND). Untuk 1 + 1: S = 0 dan C = 1, iaitu 10 dalam binari (dua). Beginilah cara komputer menambah nombor!\nA B | S C\n0 0 | 0 0\n0 1 | 1 0\n1 0 | 1 0\n1 1 | 0 1',
    },
  },
  {
    id: 'bubble',
    groups: [['bubble', 'circle', 'bulatan']],
    answer: {
      en: 'The small circle (bubble) at the output of a gate symbol means NOT. That is why NAND looks like AND with a bubble, and NOR looks like OR with a bubble.',
      ms: 'Bulatan kecil pada output simbol get bermaksud NOT. Sebab itu NAND kelihatan seperti AND dengan bulatan, dan NOR kelihatan seperti OR dengan bulatan.',
    },
  },
  {
    id: 'bar',
    groups: [['bar', 'overline', 'garis']],
    answer: {
      en: 'A bar on top means NOT. Ā is read "NOT A". A bar over a whole group, like (A · B) with a bar, means NOT of the whole group, which is NAND.',
      ms: 'Garis di atas bermaksud NOT. Ā dibaca "NOT A". Garis di atas seluruh kumpulan, seperti (A · B) dengan garis, bermaksud NOT bagi seluruh kumpulan, iaitu NAND.',
    },
  },
  {
    id: 'boolean',
    groups: [
      ['boolean'],
      [
        'expression',
        'ungkapan',
        'what',
        'apa',
        'mean',
        'maksud',
        'write',
        'tulis',
        'symbol',
        'simbol',
      ],
    ],
    answer: {
      en: 'A Boolean expression writes a circuit as a formula. Symbols: · means AND, + means OR, a bar on top means NOT, ⊕ means XOR. Example: Y = (A + B) · C̄ means "A or B, and not C".',
      ms: 'Ungkapan Boolean menulis litar sebagai formula. Simbol: · bermaksud AND, + bermaksud OR, garis di atas bermaksud NOT, ⊕ bermaksud XOR. Contoh: Y = (A + B) · C̄ bermaksud "A atau B, dan bukan C".',
    },
  },
  {
    id: 'transistor',
    groups: [['transistor']],
    answer: {
      en: 'A transistor is a tiny electronic switch with no moving parts. Logic gates are built from a few transistors each, and a modern phone chip has more than 10 billion of them.',
      ms: 'Transistor ialah suis elektronik kecil tanpa bahagian bergerak. Setiap get logik dibina daripada beberapa transistor, dan cip telefon moden mempunyai lebih daripada 10 bilion transistor.',
    },
  },
  {
    id: 'bulbGoal',
    groups: [
      ['bulb', 'mentol', 'lampu', 'light'],
      ['correct', 'betul', 'wrong', 'salah', 'off', 'padam', 'mati', 'must', 'mesti'],
    ],
    answer: {
      en: 'A lit bulb only means its output is 1. It is correct when it matches its goal: "must be ON" needs 1 and "must stay OFF" needs 0. The ✓ or ✗ badge after a test tells you if it is right.',
      ms: 'Mentol yang menyala hanya bermaksud outputnya 1. Ia betul apabila sepadan dengan matlamatnya: "mesti HIDUP" memerlukan 1 dan "mesti kekal PADAM" memerlukan 0. Lencana ✓ atau ✗ selepas ujian menunjukkan sama ada ia betul.',
    },
  },
  {
    id: 'coins',
    groups: [['coin', 'syiling']],
    answer: {
      en: 'You earn coins from stars on new levels, lessons, SPM practice, badges and the daily challenge. Spend them on hints (5, 10 then 15 coins) or on board skins in the shop.',
      ms: 'Anda mendapat syiling daripada bintang dalam tahap baharu, pelajaran, latihan SPM, lencana dan cabaran harian. Belanjakan untuk petunjuk (5, 10 kemudian 15 syiling) atau rupa papan di kedai.',
    },
  },
  {
    id: 'boss',
    groups: [['boss', 'bos']],
    answer: {
      en: 'In a boss battle, every circuit you fix fires an attack. Fix circuits fast for critical hits, and avoid wrong tests, because they let the boss charge closer. The last two bosses hide your chips for a few seconds, so remember where you put each gate!',
      ms: 'Dalam pertarungan bos, setiap litar yang anda baiki melancarkan serangan. Baiki litar dengan cepat untuk serangan kritikal, dan elakkan ujian yang salah, kerana bos akan mara lebih dekat. Dua bos terakhir menyembunyikan cip anda seketika, jadi ingat di mana anda letak setiap get!',
    },
  },
];

const STOP = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'do',
  'does',
  'i',
  'me',
  'my',
  'in',
  'of',
  'to',
  'it',
  'yang',
  'ini',
  'itu',
]);

/** Lower case words, with logic symbols turned into words the groups can match. */
export function tokenize(question: string): string[] {
  return (
    question
      // Lower case "and", "or" and "not" are usually ordinary words ("3 or more inputs"), so
      // they only name a gate when "gate" follows. Written in capitals, they always do.
      .replace(/\b(and|or|not)\b(?!\s+gates?\b|\s+get\b)/g, ' ')
      .toLowerCase()
      .replace(/1\s*\+\s*1/g, ' oneplusone ')
      .replace(/·/g, ' dot ')
      .replace(/⊕/g, ' xor ')
      .replace(/\+/g, ' plus ')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((word) => word && !STOP.has(word))
  );
}

const wordMatches = (word: string, key: string) =>
  word === key || (key.length >= 4 && word.startsWith(key));

/** How well an entry fits: the number of groups matched, or 0 if it does not fit at all. */
function score(entry: FaqEntry, words: string[]): number {
  if (entry.not?.some((banned) => words.some((word) => wordMatches(word, banned)))) return 0;
  const allGroups = entry.groups.every((group) =>
    group.some((key) => words.some((word) => wordMatches(word, key))),
  );
  return allGroups ? entry.groups.length : 0;
}

/** The best answer from the bank, or null when no entry fits the question. */
export function findFaqAnswer(question: string, lang: 'en' | 'ms'): string | null {
  const words = tokenize(question);
  let best: FaqEntry | null = null;
  let bestScore = 0;
  for (const entry of FAQ) {
    const value = score(entry, words);
    if (value > bestScore) {
      best = entry;
      bestScore = value;
    }
  }
  return best ? best.answer[lang] : null;
}

/**
 * Up to two answers that share words with the question, even if they do not fully fit.
 * They are sent to the AI as reference notes, and shown if the AI is too slow.
 */
export function relatedFaqAnswers(question: string, lang: 'en' | 'ms'): string[] {
  const words = tokenize(question);
  return FAQ.map((entry) => ({
    entry,
    overlap: entry.groups.filter((group) =>
      group.some((key) => words.some((word) => wordMatches(word, key))),
    ).length,
  }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 2)
    .map(({ entry }) => entry.answer[lang]);
}
