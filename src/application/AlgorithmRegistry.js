import { BubbleSort, SelectionSort, InsertionSort, MergeSort, QuickSort, HeapSort, CountingSort, RadixSort } from './algorithms/sorting';
import { LinearSearch, BinarySearch, JumpSearch } from './algorithms/searching';
import { BSTree, AVLTree, HeapTree } from './algorithms/trees';
import { BFS, DFS, Dijkstra, Prim, Kruskal } from './algorithms/graphs';
import { ArrayDS, StackDS, QueueDS, SinglyLinkedList, DoublyLinkedList, CircularLinkedList, OrderedLinkedList } from './algorithms/dataStructures';
import { FibonacciDP, Knapsack01, LCS, CoinChangeDP } from './algorithms/dp';
import { ActivitySelection, FractionalKnapsack, GreedyCoinChange } from './algorithms/greedy';
import {
  FCFS,
  SJF,
  SRTF,
  PriorityScheduling,
  RoundRobin,
  MultilevelQueue,
  MultilevelFeedbackQueue,
} from './algorithms/scheduling';

const _registry = new Map();

function register(algorithm) {
  _registry.set(algorithm.id, algorithm);
}

[BubbleSort, SelectionSort, InsertionSort, MergeSort, QuickSort, HeapSort, CountingSort, RadixSort,
 LinearSearch, BinarySearch, JumpSearch,
 BSTree, AVLTree, HeapTree,
 BFS, DFS, Dijkstra, Prim, Kruskal,
 ArrayDS, StackDS, QueueDS, SinglyLinkedList, DoublyLinkedList, CircularLinkedList, OrderedLinkedList,
 FibonacciDP, Knapsack01, LCS, CoinChangeDP,
 ActivitySelection, FractionalKnapsack, GreedyCoinChange,
 FCFS, SJF, SRTF, PriorityScheduling, RoundRobin, MultilevelQueue, MultilevelFeedbackQueue,
].forEach(Algo => register(new Algo()));

export function getAlgorithm(id) {
  const algo = _registry.get(id);
  if (!algo) throw new Error(`Algorithm "${id}" not found in registry`);
  return algo;
}

export function getAllAlgorithms() {
  return [..._registry.values()];
}

export function getAlgorithmsByCategory(category) {
  return [..._registry.values()].filter(a => a.category === category);
}

export function getAlgorithmIds() {
  return [..._registry.keys()];
}
