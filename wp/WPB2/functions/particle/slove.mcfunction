execute positioned as @s[tag=plove] run tellraw @s {"rawtext":[{"text":"§b[系统]禁用成功"}]}
execute positioned as @s[tag=!plove] run tellraw @s {"rawtext":[{"text":"§b[系统]禁用失败，你还没有装备这个粒子"}]}
execute positioned as @s[tag=plove] run tag @s remove plove