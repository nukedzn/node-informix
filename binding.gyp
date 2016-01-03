{
	'targets' : [
		{
			'target_name' : 'esqlc',
			'type' : 'none',
			'conditions' : [
				[ '(OS == "linux" or OS == "mac")', {
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
				} ],
				[ 'OS == "win"', {
					'actions' : [ {
						'action_name' : 'esql-preprocess',
						'inputs' : [
							'src/esqlc.ecpp'
						],
						'outputs' : [
							'esqlc.C'
						],
						'action' : [ 'esql', '-thread', '-e', '<@(_inputs)' ]
					}, {
						'action_name' : 'move',
						'inputs' : [
							'esqlc.C'
						],
						'outputs' : [
							'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp'
						],
						'action' : [ 'move', 'esqlc.C', '<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp' ]
					} ]
				} ]
			]
		},
		{
			'target_name' : 'ifx',
			'dependencies' : [ 'esqlc' ],
			'sources' : [
				'src/module.cpp',
				'src/ifx/ifx.cpp',
				'src/ifx/workers/connect.cpp',
				'src/ifx/workers/disconnect.cpp',
				'src/ifx/workers/stmtprepare.cpp',
				'src/ifx/workers/stmtexec.cpp',
				'src/ifx/workers/stmtfree.cpp',
				'src/ifx/workers/fetch.cpp',
				'src/ifx/workers/cursorclose.cpp',
				'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp',
			],
			'conditions' : [
				[ 'OS == "mac"', {
					'link_settings' : {
						'libraries' : [
							'<!@(THREADLIB=POSIX esql -static -thread -libs)'
						]
					},
					'xcode_settings' : {
						'MACOSX_DEPLOYMENT_TARGET' : '10.7'
					}
				} ],
				[ 'OS == "linux"', {
					'link_settings' : {
						'libraries' : [
							'<!@(THREADLIB=POSIX esql -thread -libs)'
						]
					}
				} ],
				[ 'OS == "win"', {
					'link_settings' : {
						'libraries' : [
							'<!@(esql -static -thread -libs)'
						]
					}
				} ]
			],
			'defines' : [
				'IFX_THREAD',
				'_REENTRANT'
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
				]
			}
		}
	]
}

