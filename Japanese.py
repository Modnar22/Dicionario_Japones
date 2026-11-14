#import Hiragana
from colorama import init
init(autoreset=True)
#from colorama import Fore
print("""Hello! and welcome to your japanese\033[32m python\033[39m teacher!
First of all, we gonna introduce you to the\033[31m japanese\033[39m alphabet system, that is composed by 3 different alphabets.
They are \033[31m HIRAGANA\033[39m,\033[31m KATAKANA\033[39m and \033[31m KANJI\033[39m. 
On this first part, we gonna introduce you to the Hiragana Writing System.""")
print(input("Press Enter to continue."))
import tkinter as tk

janela = tk.Tk()
janela.title("Hiragana")

label = tk.Label(janela, text="""
A = あ　I = い　U = う　E =　え　O = お

KA = か　KI =　き　KU =　く　KE =　け　KO = こ

SA = さ　SHI = し　SU =　す　SE =　せ　SO = そ

TA = た　CHI = ち　TSU =　つ　TE =　て　TO = と

NA = な　NI =　に　NU =　ぬ　NE =　ね　NO = の

HA = は　HI =　ひ　FU =　ふ　HE =　へ　HO = ほ

MA = ま　MI =　み　MU =　む　ME =　め　MO = も

YA = や　YU =　ゆ　YO =　よ

RA = ら　RI = り　RU =　る　RE =　れ　RO = ろ

WA = わ　WO =　を　N =　ん
"""
                 , font=("Arial",14))
label.pack(padx=20, pady=20)

janela.mainloop()
print(input("Press Enter to continue."))
import tkinter as tk

janela = tk.Tk()
janela.title("Katakana Chart")

label = tk.Label(janela, text="""
A = ア　I = イ　U = ウ　E =　エ　O = オ

KA = カ　KI =　キ　KU =　ク　KE =　ケ　KO = コ

SA = サ　SHI =　シ　SU =　ス　SE =　セ　SO = ソ

TA = タ　CHI = 千　TSU =　ツ　TE =　テ　TO = ト

NA = ナ　NI =　二　NU =　ヌ　NE =　ネ　NO = ノ

HA = ハ　HI =　ヒ　FU =　フ　HE =　ヘ　HO =　ホ

MA = マ　MI =　三　MU =　ム　ME =　メ　MO = モ

YA = ヤ　YU =　ユ　YO =　ヨ

RA = ラ　RI = リ　RU =　ル　RE =　レ　RO = ロ

WA = ワ　WO =　ヲ　N =　ン
"""
                 , font=("Arial",14))
label.pack(padx=20, pady=20)

janela.mainloop()
print(input("Press Enter to continue."))

print("Qual é este caractere em japonês? あ\n")
resposta = input("Resposta: ")
if resposta.upper() == 'A':
    print("Correto!")
else:
    print("Tente novamente!")
