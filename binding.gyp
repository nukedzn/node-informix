{
	'targets' : [
		{
			'target_name' : 'ifx',
			'sources' : [
				'src/module.cpp',
				'src/ifx/connection.cpp'
			],
			'include_dirs' : [
				'<!(node -e "require(\'nan\')")'
			]
		}
	]
}

