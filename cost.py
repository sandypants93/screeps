import getopt
from sys import argv


def calc(m, w, k=1):
    f = 2 * (w * k - m)
    t, o = divmod(k * w, m)
    if o > 0:
        t += 1
    return ("Fatigue after move: {}".format(f), "Ticks until move: {}".format(t))

def cost(move=0, work=0, carry=0, attack=0, rattack=0, heal=0, claim=0, tough=0):
    cost = (move * 50) + (work * 100) + (carry * 50) + (attack * 80)
    cost += (rattack * 150) + (heal * 250) + (claim * 600) + (tough * 10)
    parts = work + attack + rattack + heal + claim + tough
    c_parts = parts + carry
    e = "    While empty:\n        {}\n        {}"
    l = "    While laden:\n        {}\n        {}"
    ep = calc(move, parts)
    lp = calc(move, c_parts)
    er = calc(move, parts, k=0.5)
    lr = calc(move, c_parts, k=0.5)
    es = calc(move, parts, k=5)
    ls = calc(move, c_parts, k=5)
    print("Total Cost: {}".format(cost))
    print("On plain:")
    print(e.format(*ep))
    print(l.format(*lp))
    print("On road:")
    print(e.format(*er))
    print(l.format(*lr))
    print("On swamp:")
    print(e.format(*es))
    print(l.format(*ls))

def main():
    usage = "usage cost.py <opt> <num> [<opt> <num> ...]" 
    try:
        opts, args = getopt.getopt(argv[1:], 'm:w:c:a:r:h:l:t:',
                                   longopts=['move=', 'work=',
                                             'carry=', 'attack=',
                                             'rattack=', 'heal=',
                                             'claim=', 'tough='])
    except getopt.GetoptError:
        print("cost.py: " + usage)
        exit(1)
    params = [0 for i in range(8)]
    for opt in opts:
        if opt[0] == '--move' or opt[0] == '-m':
            params[0] = opt[1]
        if opt[0] == '--work' or opt[0] == '-w':
            params[1] = opt[1]
        if opt[0] == '--carry' or opt[0] == '-c':
            params[2] = opt[1]
        if opt[0] == '--attack' or opt[0] == '-a':
            params[3] = opt[1]
        if opt[0] == '--rattack' or opt[0] == '-r':
            params[4] = opt[1]
        if opt[0] == '--heal' or opt[0] == '-h':
            params[5] = opt[1]
        if opt[0] == '--claim' or opt[0] == '-l':
            params[6] = opt[1]
        if opt[0] == '--tough' or opt[0] == '-t':
            params[7] = opt[1]
    try:
        move, work, carry, attack, rattack, heal, claim, tough = list(map(int, params))
    except ValueError:
        print('cost.py: ' + usage)
        exit(1)
    cost(move=move, work=work, carry=carry, attack=attack, rattack=rattack, heal=heal, claim=claim, tough=tough)

if __name__ == "__main__":
    main()
