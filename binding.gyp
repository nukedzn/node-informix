{
	'targets' : [
		{
			'target_name' : 'esqlc',
			'type' : 'none',
			'actions' : [ {
				'action_name' : 'esql-preprocess',
				'inputs' : [
					'src/esqlc.ecpp'
				],
				'outputs' : [
					'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp'
				],
				'action' : [ 'bash', './gyp/preprocessor.sh', '<(SHARED_INTERMEDIATE_DIR)/src' ]
			} ]
		},
		{
			'target_name' : 'ifx',
			'dependencies' : [ 'esqlc' ],
			'sources' : [
				'src/module.cpp',
				'src/ifx/ifx.cpp',
				'src/ifx/workers/connect.cpp',
				'src/ifx/workers/stmtprepare.cpp',
				'src/ifx/workers/stmtrun.cpp',
				'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp',
			],
			'conditions' : [
				[ 'OS=="mac"', {
					'xcode_settings': {
						'MACOSX_DEPLOYMENT_TARGET': '10.7'
					}
				} ]
			],
			'defines' : [
				'IFX_THREAD'
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

