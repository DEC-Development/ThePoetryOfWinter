tag @s add stone_dagger_skill
playanimation @s animation.humanoid.sprint
execute positioned ^^^0.8 run damage @e[type=!item,x=~-0.3,y=~-0.4,z=~-0.3,dx=0.6,dy=2,dz=0.6,tag=!stone_dagger_skill] 13 entity_attack entity @s
tag @s remove stone_dagger_skill