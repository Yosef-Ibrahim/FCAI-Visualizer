//
//  B_Tree.h
//  B-Tree
//
//  Created by Kareem Ahmed on 2026-10-21.
//

#ifndef B_TREE_H
#define B_TREE_H

#include <iostream>

using namespace std;

// /* =========================================================
//    Node 
//    ========================================================= */
template<typename Type, int Ord>
struct Node
{
    bool is_leaf;
    int  number_keys;
    Type key[Ord];              

    Node(bool leaf)
    {
        is_leaf = leaf;
        number_keys = 0; 
    }    
    virtual ~Node() {}          // delete  Node
};

// /* =========================================================
//    InternalNode has children
//    ========================================================= */
template<typename Type, int Ord>
struct InternalNode : public Node<Type, Ord>
{
    Node<Type, Ord>* child[Ord + 1];

    InternalNode() : Node<Type, Ord>(false)
    {
        for (int i = 0; i <= Ord; ++i)
            child[i] = nullptr;
    }

    ~InternalNode()
    {
        for (int i = 0; i <= this->number_keys; ++i)
            delete child[i];    // delete children
    }
};

// /* =========================================================
//    LeafNode  keys only
//    ========================================================= */
template<typename Type, int Ord>
struct LeafNode : public Node<Type, Ord>
{
    LeafNode() : Node<Type, Ord>(true){}
};

// /* =========================================================
//    BTree
//    ========================================================= */
template<typename Type, int Ord>
struct BTree
{
    typedef Node<Type, Ord>         NodeT;
    typedef InternalNode<Type, Ord> InternalT;
    typedef LeafNode<Type, Ord>     LeafT;
    static const int MIN_KEYS = (Ord - 1) / 2;

    NodeT* root;

    BTree() : root(nullptr) {}
    ~BTree() { delete root; }

    // ---------------------------------------------------------
    // split a full node (num_keys == Ord).
    // left half stays in node, the middle key goes to med,
    // the right half goes to the returned new node.
    // ---------------------------------------------------------
    NodeT* split(NodeT* node, Type& med)
    {
        int n   = node->number_keys;
        int mid = n / 2;
        med = node->key[mid];

        NodeT* right;
        if (node->is_leaf)
        {
            LeafT* r = new LeafT();
            for (int i = mid + 1; i < n; ++i){
                r->key[i - mid - 1] = node->key[i];
            }
                
            r->number_keys = n - mid - 1;
            right = r;
        }
        else
        {
            InternalT* left = static_cast<InternalT*>(node);
            InternalT* r    = new InternalT();
            for (int i = mid + 1; i < n; ++i){
                r->key[i - mid - 1] = left->key[i];
            }
            // children: indices mid+1 .. n  (n - mid children)
            for (int i = mid + 1; i <= n; ++i)
            {
                r->child[i - mid - 1] = left->child[i];
                left->child[i] = nullptr;
            }
            r->number_keys = n - mid - 1;
            right = r;
        }
        node->number_keys = mid;
        return right;
    }

    // ---------------------------------------------------------
    // Recursive insert. Returns true if `node` became full and
    // was split; then `med` and `newRight` hold the result and
    // the caller must insert them into the parent.
    // ---------------------------------------------------------
    bool insertRec(NodeT* node, Type value, Type& med, NodeT*& newRight)
    {
        if (node->is_leaf)
        {
            int i = node->number_keys - 1;
            while (i >= 0 && node->key[i] > value)
            {
                node->key[i + 1] = node->key[i];
                --i;
            }
            node->key[i + 1] = value;
            ++node->number_keys;
        }
        else
        {
            InternalT* in = static_cast<InternalT*>(node);

            int i = 0;
            while (i < in->number_keys && value > in->key[i])
                ++i;

            Type   childMed;
            NodeT* childRight = nullptr;
            if (insertRec(in->child[i], value, childMed, childRight))
            {
                // shift keys and children to make room
                for (int j = in->number_keys; j > i; --j)
                    in->key[j] = in->key[j - 1];
                for (int j = in->number_keys + 1; j > i + 1; --j)
                    in->child[j] = in->child[j - 1];

                in->key[i]       = childMed;
                in->child[i + 1] = childRight;
                ++in->number_keys;
            }
        }

        if (node->number_keys == Ord)
        {
            newRight = split(node, med);
            return true;
        }
        return false;
    }

    void Insert(Type value)
    {
        if (root == nullptr)
        {
            root = new LeafT();
            root->key[0] = value;
            root->number_keys = 1;
            return;
        }

        Type   med;
        NodeT* right = nullptr;
        if (insertRec(root, value, med, right))
        {
            InternalT* newRoot = new InternalT();
            newRoot->key[0]   = med;
            newRoot->number_keys = 1;
            newRoot->child[0] = root;
            newRoot->child[1] = right;
            root = newRoot;
        }
    }

   
    // Printing (level by level)
    int getHeight() const
    {
        int h = 1;
        NodeT* cur = root;
        while (!cur->is_leaf)
        {
            cur = static_cast<InternalT*>(cur)->child[0];
            ++h;
        }
        return h;
    }




  
    //                      DELETE
    

    // biggest key in the subtree (go right until leaf)
    Type getMax(NodeT* node)
    {
        while (!node->is_leaf)
            node = static_cast<InternalT*>(node)->child[node->number_keys];
        return node->key[node->number_keys - 1];
    }
 
    // take one key from the LEFT sibling
    void borrowFromLeft(InternalT* parent, int i)
    {
        NodeT* child = parent->child[i];
        NodeT* left  = parent->child[i - 1];
 
        // make room at the front of child
        for (int j = child->number_keys; j > 0; --j)
            child->key[j] = child->key[j - 1];
        child->key[0] = parent->key[i - 1];          // parent's key comes down
 
        if (!child->is_leaf)
        {
            InternalT* c = static_cast<InternalT*>(child);
            InternalT* l = static_cast<InternalT*>(left);
            for (int j = child->number_keys + 1; j > 0; --j)
                c->child[j] = c->child[j - 1];
            c->child[0] = l->child[left->number_keys];  // last child of left moves over
            l->child[left->number_keys] = nullptr;
        }
 
        parent->key[i - 1] = left->key[left->number_keys - 1];  // left's last key goes up
        --left->number_keys;
        ++child->number_keys;
    }
 
    // take one key from the RIGHT sibling
    void borrowFromRight(InternalT* parent, int i)
    {
        NodeT* child = parent->child[i];
        NodeT* right = parent->child[i + 1];
 
        child->key[child->number_keys] = parent->key[i];  // parent's key comes down
 
        if (!child->is_leaf)
        {
            InternalT* c = static_cast<InternalT*>(child);

            InternalT* r = static_cast<InternalT*>(right);

            c->child[child->number_keys + 1] = r->child[0]; // first child of right moves over
            for (int j = 0; j < right->number_keys; ++j)
                r->child[j] = r->child[j + 1];
            r->child[right->number_keys] = nullptr;
        }
 
        parent->key[i] = right->key[0];                    // right's first key goes up
        for (int j = 0; j < right->number_keys - 1; ++j)
            right->key[j] = right->key[j + 1];
 
        --right->number_keys;
        ++child->number_keys;
    }
 
    // merge parent->child[i] + parent->key[i] + parent->child[i+1] into child[i]
    void mergeChildren(InternalT* parent, int i)
    {
        NodeT* left  = parent->child[i];
        NodeT* right = parent->child[i + 1];
 
        // parent's key comes down to the end of left
        left->key[left->number_keys] = parent->key[i];
 
        // copy right's keys
        for (int j = 0; j < right->number_keys; ++j)
            left->key[left->number_keys + 1 + j] = right->key[j];
 
        if (!left->is_leaf)
        {
            InternalT* l = static_cast<InternalT*>(left);
            InternalT* r = static_cast<InternalT*>(right);
            for (int j = 0; j <= right->number_keys; ++j)
            {
                l->child[left->number_keys + 1 + j] = r->child[j];
                r->child[j] = nullptr;        // so deleting right won't delete them
            }
        }
 
        left->number_keys += 1 + right->number_keys;
 
        // remove key i and child i+1 from the parent
        for (int j = i; j < parent->number_keys - 1; ++j)
            parent->key[j] = parent->key[j + 1];
        for (int j = i + 1; j < parent->number_keys; ++j)
            parent->child[j] = parent->child[j + 1];
        parent->child[parent->number_keys] = nullptr;
        --parent->number_keys;
 
        delete right;
    }
 
    // if parent->child[i] has fewer than MIN_KEYS keys, repair it
    void fixChild(InternalT* parent, int i)
    {
        if (parent->child[i]->number_keys >= MIN_KEYS)
            return;
 
        if (i > 0 && parent->child[i - 1]->number_keys > MIN_KEYS)
            borrowFromLeft(parent, i);
        else if (i < parent->number_keys && parent->child[i + 1]->number_keys > MIN_KEYS)
            borrowFromRight(parent, i);
        else if (i > 0)
            mergeChildren(parent, i - 1);
        else
            mergeChildren(parent, i);
    }
 
    // returns true if the value was found and deleted
    bool deleteRec(NodeT* node, Type value)
    {
        int i = 0;
        while (i < node->number_keys && node->key[i] < value)
            ++i;
 
        bool found = (i < node->number_keys && node->key[i] == value);
 
        //  leaf 
        if (node->is_leaf)
        {
            if (!found) return false;
            for (int j = i; j < node->number_keys - 1; ++j)
                node->key[j] = node->key[j + 1];
            --node->number_keys;
            return true;
        }
 
        // ---------- internal ----------
        InternalT* in = static_cast<InternalT*>(node);
        bool result;
 
        if (found)
        {
            // replace with predecessor, then delete the predecessor below
            Type pred = getMax(in->child[i]);
            in->key[i] = pred;
            result = deleteRec(in->child[i], pred);
        }
        else
        {
            result = deleteRec(in->child[i], value);
        }
 
        fixChild(in, i);
        return result;
    }
 
    bool Delete(Type value)
    {
        if (root == nullptr)
            return false;
 
        bool result = deleteRec(root, value);
 
        // shrink the tree if the root became empty
        if (root->number_keys == 0)
        {
            NodeT* old = root;
            if (old->is_leaf)
                root = nullptr;
            else
            {
                InternalT* in = static_cast<InternalT*>(old);
                root = in->child[0];
                in->child[0] = nullptr;
            }
            delete old;
        }
        return result;
    }




    void printNode(NodeT* node, int depth) const
    {
        for (int i = 0; i < depth; ++i)
            cout << "  ";

        for (int i = 0; i < node->number_keys; ++i)
        {
            if (i > 0) cout << ",";
            cout << node->key[i];
        }
        cout << endl;

        if (!node->is_leaf)
        {
            InternalT* in = static_cast<InternalT*>(node);
            for (int i = 0; i <= in->number_keys; ++i)
                printNode(in->child[i], depth + 1);
        }
    }

    void Print() const
    {
        if (root == nullptr)
        {
            cout << "The B-Tree is Empty" << endl;
            return;
        }
        printNode(root, 0);
        cout << endl;
    }
};

#endif








