export const STRING_PATTERNS = {
  // 구분자
  Comma: ',',
  Hyphen: '-',
  Space: ' ',
  Tab: '\t',
  NewLine: '\n',
  Empty: '',
    
  // 괄호
  OpenBracket: '[',
  CloseBracket: ']',
    
  // 화폐
  Won: '원',
    
  // 기호
  Plus: '+',
  Minus: '-',
    
  // 파일 관련
  FileEncoding: 'utf8',
    
  // 날짜 형식
  DateSeparator: '-',
    
  // 출력 형식
  ErrorPrefix: '[ERROR]',
    
  // 입력 검증 패턴
  ProductInputRegex: /^\[([^\-\]]+)-([1-9]\d*)\]$/,
  DateFormatRegex: /^\d{4}-\d{2}-\d{2}$/,
    
  // 정렬
  AlignLeft: 'left',
  AlignRight: 'right',
  AlignCenter: 'center'
};
