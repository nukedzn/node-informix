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
				'src/ifx/workers/disconnect.cpp',
				'src/ifx/workers/stmtprepare.cpp',
				'src/ifx/workers/stmtexec.cpp',
				'src/ifx/workers/stmtfree.cpp',
				'src/ifx/workers/fetch.cpp',
				'src/ifx/workers/cursorclose.cpp',
				'<(SHARED_INTERMEDIATE_DIR)/src/esqlc.cpp',
			],
			'conditions' : [
				[ 'OS=="mac"', {
					'xcode_settings' : {
						'MACOSX_DEPLOYMENT_TARGET' : '10.7',
						'OTHER_LDFLAGS' : [
							'-headerpad_max_install_names'
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
					'<!@(THREADLIB=POSIX esql -thread -libs)'
				]
			}
		},
		{
			'target_name' : 'mac-otool',
			'type' : 'none',
			'dependencies' : [ 'ifx' ],
			'conditions' : [
				[ 'OS=="mac"', {
					'variables' : {
						'IFX_PRODUCT%' : '<(PRODUCT_DIR)/ifx.node'
					},
					'actions' : [ {
						'action_name' : 'fix-mac-dylib-install-names',
						'inputs' : [
							'<(IFX_PRODUCT)'
						],
						'outputs' : [
							''
						],
						'action' : [ 'bash', './gyp/otool.sh', '<(IFX_PRODUCT)' ]
					} ]
				} ]
			]
		}
	]
}

