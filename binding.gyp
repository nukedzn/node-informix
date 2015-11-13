{
	'targets' : [
		{
			'target_name' : 'ifx',
			'sources' : [
				'src/module.cpp'
			],
			'include_dirs' : [
				'<!(node -e "require(\'nan\')")'
			]
		}
	]
}

