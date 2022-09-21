The original bug Gareth found was actually a feature. We've plotted the coilpos and coilori vectors based on the labels in he grad structure, but these don't always directly map (especially with any MEG systems with gradiometers, where coils > channels). What we should have done was plotted the channelpos and channelori elements and seen they remained intact.

Let me explain myself. Lets look at the balancing maticies. 

![image](https://user-images.githubusercontent.com/3579812/191491233-6d923c29-f35b-4f03-9bfd-da2503c3528f.png)

In the after column we see the two excluded channels have sunk to the bottom of the matrix. And this is reflected in the channel label ordering, and the channel position ordering.

```
K>> oldgrad.label{3}

ans =

    'G2-MW-Y'

K>> newgrad.label{58}

ans =

    'G2-MW-Y'

K>> oldgrad.chanpos(3,:)

ans =

  -71.4860 -174.8760  -79.6388

K>> newgrad.chanpos(58,:)

ans =

  -71.4860 -174.8760  -79.6388

```

HOWEVER coilpos and coilori don't change, just checking whether coilpos has also moved to elemet 58.

```
K>> oldgrad.coilpos(3,:)

ans =

  -71.4860 -174.8760  -79.6388

K>> newgrad.coilpos(3,:)

ans =

  -71.4860 -174.8760  -79.6388

K>> newgrad.coilpos(58,:)

ans =

  -33.5954 -176.7161  -38.1532

```

But that doesn't matter as the balancing matrix shows that in the old array channel 3 (G2-MW-Y) uses coil 3, but in the new array even though G2-MW-Y is now channel 58, the coil info hasn't moved and the matrix is still telling us to use coil 3.