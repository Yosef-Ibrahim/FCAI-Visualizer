#include "B_Tree.h"

int main()
{
    BTree<int, 3> t1;
    int a[] = {1, 5, 0, 4, 3, 2};
    for (int x : a) t1.Insert(x);
    t1.Print();
    t1.Delete(4);
    t1.Print();

    BTree<char, 5> t;
    char c[] = {'G','I','B','J','C','A','K','E','D','S',
                'T','R','L','F','H','M','N','P','Q'};
    for (char x : c) t.Insert(x);
    t.Print();

    return 0;
}