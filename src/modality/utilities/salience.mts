import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const nlp = winkNLP(model, ["sbd", "pos"]);
const its = nlp.its;

const sortAscending = (weights: number[]) =>
  weights.slice().sort((a, b) => a - b);

/**
 * source: https://stackoverflow.com/a/55297611
 */
export function quantile(weights: number[], q: number): number {
  const sorted = sortAscending(weights);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

/**
 * This function is used to extract salient sentences from a given text.
 *
 * All credit goes to the author(s) of the following article:
 * https://observablehq.com/@winkjs/how-to-visualize-key-sentences-in-a-document
 *
 * I just ported it to TypeScript a bit.
 */
export function getImportantSentences(text: string, cutoff: number) {
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences();
  const openClassPOS = Object.create({
    ADJ: true,
    ADV: true,
    INTJ: true,
    NOUN: true,
    PROPN: true,
    VERB: true,
    NUM: true,
    SYM: true,
  });

  /**
   * N-gram to use to construct a pos group.
   */
  const NGram = 4;

  /**
   * Used to build table of weights of pos groups. Apart from frequency, it also maintains
   * (a) array of sentences, where a given pos group was found, (b) total weight computed as
   * frequency minus count of closed class part-of-speech in the group.
   */
  const posGroupWeightTable: Record<
    string,
    { group: string; sentences: number[]; weight: number; iv: number }
  > = {};

  // build pos group frequency table.
  sentences.each((s) => {
    // ignore punctuation and space (tab, CRLF etc).
    const pos = s
      .tokens()
      .out(its.pos)
      .filter((p) => p !== "SPACE" && p !== "PUNCT");

    // Ignore sentences where we cannot build NGram i.e. sentences shorter than NGram.
    if (pos.length < NGram) {
      return;
    }

    // Determine NGrams;
    for (let k = 0; k + NGram - 1 < pos.length; k += 1) {
      const pos4Gram = pos.slice(k, k + NGram);
      // Used to compute the weight for a pos group.
      const initInfoContent = pos4Gram.reduce(
        (pv, cv) => pv - (openClassPOS[cv] ? 0 : 1),
        0
      );

      const posGroup = pos4Gram.join("_");

      // instead, let's declare it in one go
      posGroupWeightTable[posGroup] = {
        group: posGroup,
        sentences: (posGroupWeightTable[posGroup]?.sentences ?? []).concat(
          s.index()
        ),
        weight:
          posGroupWeightTable[posGroup]?.weight === undefined
            ? initInfoContent + 1
            : posGroupWeightTable[posGroup].weight + 1,
        iv: initInfoContent,
      };
    }
  });

  // Transform object into an array, and filter out elements with weight <= 0.
  const posGroupWeightsList = Object.keys(posGroupWeightTable)
    .map((e) => posGroupWeightTable[e])
    .filter((e) => e.weight > 0);

  // This is an array index by each sentence's index and would contain the total weight
  // computed by adding all the weights of each pos group found in that sentence.
  let sentenceWiseWeights: number[] = new Array(sentences.length());
  sentenceWiseWeights.fill(0);

  for (const posGroupWeights of posGroupWeightsList) {
    for (const sentence of posGroupWeights.sentences) {
      sentenceWiseWeights[sentence] += posGroupWeights.weight;
    }
  }

  // Normalize weights by first halving weight and the dividing by the max.
  // Halving reduces the relative differnce between weights.
  sentenceWiseWeights = sentenceWiseWeights.map((e) => e / 2);

  const max = Math.max(...sentenceWiseWeights);

  const sentenceNormalizedWeights = sentenceWiseWeights.map((e) => e / max);

  const cutoffWeight = quantile(sentenceNormalizedWeights, cutoff);
  return sentences
    .out()
    .map((sentence, index) => ({
      sentence,
      index,
      weight: sentenceNormalizedWeights[index],
    }))
    .filter((e) => e.weight >= cutoffWeight)
    .slice()
    .map(({ sentence }) => `- ${sentence}`)
    .join("\n");
}
