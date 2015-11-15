{
	'targets' : [
		{
			'target_name' : 'esqlc',
			'type' : 'none',
			'actions' : [ {
				'action_name' : 'esql-preprocess',
				'inputs' : [
					'src/esqlc.ec'
				],
				'outputs' : [
					'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.c'
				],
				'action' : [ 'bash', './gyp/preprocessor.sh', '<(SHARED_INTERMEDIATE_DIR)/src' ]
			} ]
		},
		{
			'target_name' : 'ifx',
			'dependencies' : [ 'esqlc' ],
			'sources' : [
				'src/module.cpp',
				'src/ifx/connect.cpp',
				'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.c',
			],
			'conditions' : [
				[ 'OS=="mac"', {
					'xcode_settings': {
						'MACOSX_DEPLOYMENT_TARGET': '10.7'
					}
				} ]
			],
			'include_dirs' : [
				'<!(node -e "require(\'nan\')")',
				'<!(echo ${INFORMIXDIR}/incl/esql)',
				'src'
			],
			'link_settings' : {
				'libraries' : [
					'-L<!(echo ${INFORMIXDIR}/lib)',
					'-L<!(echo ${INFORMIXDIR}/lib/esql)',
					'<!@(THREADLIB=POSIX esql -thread -libs)'
				]
			}
		}
	]
}

