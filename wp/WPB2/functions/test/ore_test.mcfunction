tickingarea add ~~~ ~~~ ore_test
execute positioned as @p run fill ~-10 ~-10 ~-10 ~10 ~10 ~10 air 0 replace stone -1
execute positioned as @p run fill ~-10 ~-10 ~-10 ~10 ~10 ~10 air 0 replace netherrack 0
execute positioned as @p run fill ~-10 ~-10 ~-10 ~10 ~10 ~10 air 0 replace end_stone 0
kill @e[type=falling_block]
effect @p night_vision 12 0 true