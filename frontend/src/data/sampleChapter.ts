export type WorkbookVersionId = string;
export type ChapterId = string;
export type GridspaceId = string;

export type LatexBlock = {
    type: "latex";
    id: string;
    content: string;
};

export type GridspaceBlock = {
    type: "gridspace";
    id: string;
    gridspaceId: GridspaceId;
    heightCm: number;
};

export type WorkbookBlock = LatexBlock | GridspaceBlock;

export type WorkbookChapter = {
    workbookVersionId: WorkbookVersionId;
    chapterId: ChapterId;
    title: string;
    blocks: WorkbookBlock[];
};

export const sampleChapter: WorkbookChapter = {
    workbookVersionId: "ib-aa-sl-number-algebra-module-1-v1",
    chapterId: "number-algebra-module-1-sequences-logs",
    title: "Number and Algebra Module 1: Sequences, Logarithms and Algebraic Reasoning",
    blocks: [
        {
            type: "latex",
            id: "intro-core-ideas",
            content: String.raw`
\chapter{Number and Algebra Module 1: Sequences, Logarithms and Algebraic Reasoning}

\begin{syllabusbox}
This module prepares students for non-calculator Paper 1 questions involving arithmetic and geometric sequences, finite and infinite sums, logarithm laws, elementary exponential/logarithmic equations, binomial expansion in financial contexts, and proof by algebraic manipulation.

The questions in this module are original, but they are designed to reflect the style, difficulty, and structure of recent IB Mathematics AA SL Paper 1 questions.
\end{syllabusbox}

\section{Core Ideas}

\subsection{Arithmetic sequences}

\begin{skillbox}
An \keyword{arithmetic sequence} has a constant difference between consecutive terms. If the first term is $u_1$ and the common difference is $d$, then
\[
    u_n = u_1 + (n-1)d.
\]
The sum of the first $n$ terms is
\[
    S_n = \frac{n}{2}\left(2u_1+(n-1)d\right)
        = \frac{n}{2}(u_1+u_n).
\]
\end{skillbox}

\begin{examtipbox}
In exam questions, arithmetic sequences often appear through two pieces of information, such as $u_5=18$ and $u_{11}=42$. Subtracting the equations usually gives $d$ quickly.
\end{examtipbox}

\begin{notebox}
If $u_k=0$, then
\[
    u_1+(k-1)d=0.
\]
This is a common way Paper 1 questions connect a term formula with an unknown index.
\end{notebox}

\subsection{Geometric sequences}

\begin{skillbox}
A \keyword{geometric sequence} has a constant ratio between consecutive terms. If the first term is $u_1$ and the common ratio is $r$, then
\[
    u_n = u_1r^{n-1}.
\]
The sum of the first $n$ terms is
\[
    S_n = \frac{u_1(r^n-1)}{r-1}, \qquad r\neq 1,
\]
or equivalently
\[
    S_n = \frac{u_1(1-r^n)}{1-r}, \qquad r\neq 1.
\]
\end{skillbox}

\begin{examtipbox}
Use the version of the geometric sum formula that avoids unnecessary negative signs. If $r>1$, use $\frac{u_1(r^n-1)}{r-1}$. If $|r|<1$, use $\frac{u_1(1-r^n)}{1-r}$.
\end{examtipbox}

\begin{skillbox}
An infinite geometric series has a finite sum only when
\[
    |r|<1.
\]
In that case,
\[
    S_\infty = \frac{u_1}{1-r}.
\]
If $|r|\geq 1$, the infinite sum does not exist.
\end{skillbox}

\subsection{Logarithm laws}

\begin{skillbox}
For $a>0$, $b>0$, and $a\neq 1$,
\[
    \log_a(xy)=\log_a x+\log_a y,
\]
\[
    \log_a\left(\frac{x}{y}\right)=\log_a x-\log_a y,
\]
\[
    \log_a(x^k)=k\log_a x.
\]
The change of base formula is
\[
    \log_a b = \frac{\log_c b}{\log_c a}.
\]
\end{skillbox}

\begin{examtipbox}
Before solving a logarithmic equation, check the domain. For example, $\log_2(x-3)$ requires $x>3$. Any final answer outside the domain must be rejected.
\end{examtipbox}

\subsection{Binomial expansion and financial applications}

\begin{skillbox}
For a positive integer $n$,
\[
    (1+x)^n = 1+nx+\frac{n(n-1)}{2}x^2+\cdots+x^n.
\]
In compound interest questions,
\[
    A=P\left(1+\frac{r}{m}\right)^{mt},
\]
where $P$ is the principal, $r$ is the annual interest rate as a decimal, $m$ is the number of compounding periods per year, and $t$ is the time in years.
\end{skillbox}

\begin{examtipbox}
Paper 1 compound interest questions may ask for an exact expansion rather than immediate decimal calculation. Keep the rate as a fraction where possible.
\end{examtipbox}

\subsection{Algebraic proof}

\begin{skillbox}
Many proof questions ask you to show that an expression is a multiple of a number. The main strategy is to expand and factor.

For example, to show an expression is a multiple of $m$, aim to write it as
\[
    m \times \text{integer expression}.
\]
\end{skillbox}

\begin{examtipbox}
The phrase ``for all $n\in\mathbb Z^+$'' means that your proof must work for every positive integer $n$, not just for a few examples.
\end{examtipbox}

\section{Worked Examples}

\begin{workedexam}[Arithmetic terms and sums]
The third term of an arithmetic sequence is $28$ and the ninth term is $4$.
\begin{enumerate}[label=(\alph*)]
    \item Find the common difference.
    \item Find the first term.
    \item Find the smallest positive integer $n$ such that $S_n=0$.
\end{enumerate}

\Solution{
Using $u_n=u_1+(n-1)d$,
\[
    u_3=u_1+2d=28,
\]
\[
    u_9=u_1+8d=4.
\]
Subtracting gives
\[
    6d=-24,
\]
so
\[
    d=-4.
\]
Then
\[
    u_1+2(-4)=28,
\]
so
\[
    u_1=36.
\]
Now
\[
    S_n=\frac n2\left(2(36)+(n-1)(-4)\right).
\]
So
\[
    S_n=\frac n2(76-4n).
\]
Since $n>0$, $S_n=0$ when
\[
    76-4n=0,
\]
which gives
\[
    n=19.
\]
}
\end{workedexam}

\section{Practice Questions}

\begin{practicebox}[title=Practice Set A: Arithmetic sequences]
These questions are designed for Paper 1. Do not use a calculator unless your teacher instructs you to do so.
\end{practicebox}
`,
        },

        {
            type: "latex",
            id: "practice-a-q1",
            content: String.raw`
\begin{examquestion}[6 marks]
The second term of an arithmetic sequence is $31$ and the sixth term is $7$.
\begin{enumerate}[label=(\alph*)]
    \item Find the common difference.
    \item Find the first term.
    \item Find the eleventh term.
\end{enumerate}
`,
        },
        {
            type: "gridspace",
            id: "practice-a-q1-gridspace",
            gridspaceId: "m1-practice-a-q1",
            heightCm: 7,
        },
        {
            type: "latex",
            id: "practice-a-q1-end",
            content: String.raw`
\end{examquestion}
`,
        },

        {
            type: "latex",
            id: "practice-a-q2",
            content: String.raw`
\begin{examquestion}[5 marks]
The fourth term of an arithmetic sequence is $18$ and the tenth term is $-6$.
\begin{enumerate}[label=(\alph*)]
    \item Find $u_1$ and $d$.
    \item Find the value of $n$ for which $u_n=-30$.
\end{enumerate}
`,
        },
        {
            type: "gridspace",
            id: "practice-a-q2-gridspace",
            gridspaceId: "m1-practice-a-q2",
            heightCm: 7,
        },
        {
            type: "latex",
            id: "practice-a-q2-end",
            content: String.raw`
\end{examquestion}
`,
        },

        {
            type: "latex",
            id: "practice-a-q3",
            content: String.raw`
\begin{examquestion}[6 marks]
For an arithmetic sequence, $u_8=22$ and $S_{15}=270$.
Find the value of $k$ such that $u_k=0$.
`,
        },
        {
            type: "gridspace",
            id: "practice-a-q3-gridspace",
            gridspaceId: "m1-practice-a-q3",
            heightCm: 8,
        },
        {
            type: "latex",
            id: "practice-a-q3-end",
            content: String.raw`
\end{examquestion}
`,
        },

        {
            type: "latex",
            id: "practice-a-q4",
            content: String.raw`
\begin{examquestion}[6 marks]
For an arithmetic sequence, $u_6=35$ and $S_{20}=250$.
Find the first term and the common difference.
`,
        },
        {
            type: "gridspace",
            id: "practice-a-q4-gridspace",
            gridspaceId: "m1-practice-a-q4",
            heightCm: 8,
        },
        {
            type: "latex",
            id: "practice-a-q4-end",
            content: String.raw`
\end{examquestion}
`,
        },
    ],
};