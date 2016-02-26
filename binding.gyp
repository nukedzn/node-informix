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
						'action_name' : 'prepare',
						'inputs' : [
							'src/esqlc.ecpp'
						],
						'outputs' : [
							'<(INTERMEDIATE_DIR)/src/esqlc.ec'
						],
						'action' : [ 'copy', 'src/esqlc.ecpp', '<(INTERMEDIATE_DIR)/src/esqlc.ec' ]
					}, {
						'action_name' : 'esql-preprocess',
						'inputs' : [
							'<(INTERMEDIATE_DIR)/src/esqlc.ec'
						],
						'outputs' : [
							'build/esqlc.c'
						],
						'action' : [ 'esql', '-thread', '-e', '<@(_inputs)' ]
					}, {
						'action_name' : 'move',
						'inputs' : [
							'build/esqlc.c'
						],
						'outputs' : [
							'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp'
						],
						'action' : [ 'move', 'build/esqlc.c', '<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp' ]
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
				[ '(OS == "linux" or OS == "mac")', {
					'link_settings' : {
						'libraries' : [
							'-L$(INFORMIXDIR)/lib',
							'-L$(INFORMIXDIR)/lib/esql',
						]
					}
				} ],
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
							'$(INFORMIXDIR)/lib/isqlt09a.lib',
							'$(INFORMIXDIR)/lib/igl4n304.lib',
							'$(INFORMIXDIR)/lib/iglxn304.lib',
							'$(INFORMIXDIR)/lib/igo4n304.lib',
							'netapi32.lib',
							'wsock32.lib',
							'user32.lib',
							'winmm.lib',
							'advapi32.lib'
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
				'$(INFORMIXDIR)/incl/esql',
				'src'
			]
		}
	]
}

